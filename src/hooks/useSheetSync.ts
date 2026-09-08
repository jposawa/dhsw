import { useAtom, useAtomValue, useSetAtom, useStore } from 'jotai'
import React from 'react'

import { describeError, findUnsyncedCharacters, mergeRosters } from '@/helpers'
import { createSheet, fetchSheetsForUser, saveSheet } from '@/services'
import {
  authAtom,
  rosterAtom,
  sheetRolesAtom,
  syncErrorAtom,
  syncStatusAtom,
} from '@/states'
import type { SheetRoleId } from '@/types'

/**
 * Escrita segura no dedo. Segurar um stepper dispara vinte mudanças de estado;
 * sem isto, vinte escritas de rede. `dh-sw-arquitetura.md` §5.
 */
const WRITE_DEBOUNCE_MS = 800

/**
 * Sincronização das fichas com o Realtime Database.
 *
 * Local é a cópia de trabalho, sempre. O banco é sincronização e backup — o
 * app funciona inteiro sem rede, que é a premissa do produto: mesa, celular,
 * sala mal iluminada, internet ruim.
 *
 * Fluxo: puxa no login, mescla, adota o que só existia local, e daí em diante
 * empurra o que mudar, com debounce. Nunca o contrário — o remoto não manda
 * na sessão em andamento.
 */
export const useSheetSync = () => {
  const { status, user } = useAtomValue(authAtom)
  const [roster, setRoster] = useAtom(rosterAtom)
  const [syncStatus, setSyncStatus] = useAtom(syncStatusAtom)
  const setSheetRoles = useSetAtom(sheetRolesAtom)
  const setSyncError = useSetAtom(syncErrorAtom)

  // O store lê o roster atual dentro do efeito sem assiná-lo. Assinar faria
  // o pull depender do roster e criaria um laço: puxa, mescla, muda o
  // roster, puxa de novo.
  const store = useStore()

  /**
   * Três estados de sincronização, e eles são independentes de propósito.
   *
   * `syncStatus` é **só para a UI** e vale "como foi a última operação". Ele
   * não pode ser a condição de empurrar: era, e bastava uma falha — de pull
   * ou de uma escrita qualquer — para o app parar de salvar em silêncio pelo
   * resto da sessão. Quem libera a escrita é `pulledFor`.
   */
  const pulledFor = React.useRef<string | null>(null)
  /** O que o servidor já conhece. Decide entre `createSheet` e `saveSheet`. */
  const remoteIds = React.useRef<Set<string>>(new Set())
  /** Última versão cuja escrita foi despachada. Evita reescrever o que não mudou. */
  const pushedAt = React.useRef<Record<string, number>>({})

  /* ── 1. Puxar e adotar, uma vez por login ────────────────────────────── */

  React.useEffect(() => {
    if (status !== 'signed-in' || !user) {
      pulledFor.current = null
      remoteIds.current = new Set()
      pushedAt.current = {}

      return
    }

    if (pulledFor.current === user.userId) {
      return
    }

    let isCancelled = false

    const pull = async () => {
      setSyncStatus('pulling')

      try {
        const remote = await fetchSheetsForUser(user.userId)

        if (isCancelled) {
          return
        }

        const roles: Record<string, SheetRoleId> = {}
        for (const entry of remote) {
          roles[entry.character.id] = entry.roleId
          remoteIds.current.add(entry.character.id)
          pushedAt.current[entry.character.id] = entry.character.updatedAt
        }

        const merged = mergeRosters(
          store.get(rosterAtom),
          remote.map((entry) => entry.character),
        )

        // Fichas criadas antes do login — ou offline — não têm linha de
        // acesso, e sem ela a regra de segurança recusa a escrita. Adotar é
        // criá-las como se fossem novas, com esta conta como autora.
        const orphans = findUnsyncedCharacters(merged, remoteIds.current)

        for (const orphan of orphans) {
          await createSheet(orphan, user.userId)
          roles[orphan.id] = 'author'
          remoteIds.current.add(orphan.id)
          pushedAt.current[orphan.id] = orphan.updatedAt
        }

        if (isCancelled) {
          return
        }

        setRoster(merged)
        setSheetRoles(roles)
        setSyncError(null)
        setSyncStatus('ready')
      } catch (error) {
        if (!isCancelled) {
          // Não bloqueia nada: o roster local continua servindo, e o que já
          // se sabe do servidor continua valendo para as escritas seguintes.
          setSyncError(`leitura: ${describeError(error)}`)
          setSyncStatus('error')
        }
      } finally {
        // Marcado mesmo em falha: sem isto, um pull que falhou tentaria de
        // novo a cada render, e a escrita nunca destravaria.
        if (!isCancelled) {
          pulledFor.current = user.userId
        }
      }
    }

    void pull()

    return () => {
      isCancelled = true
    }
  }, [status, user, store, setRoster, setSheetRoles, setSyncError, setSyncStatus])

  /* ── 2. Empurrar o que mudou, com debounce ───────────────────────────── */

  React.useEffect(() => {
    if (!user || pulledFor.current !== user.userId) {
      return
    }

    const timer = window.setTimeout(() => {
      for (const character of Object.values(roster.characters)) {
        if (pushedAt.current[character.id] === character.updatedAt) {
          continue
        }

        // Ficha que o servidor nunca viu precisa de `createSheet`: é ela que
        // escreve a linha de acesso, e sem linha de acesso a regra de
        // segurança recusa qualquer escrita depois.
        const isNew = !remoteIds.current.has(character.id)
        const previousPush = pushedAt.current[character.id]

        // Marcado antes de resolver, para o debounce seguinte não despachar a
        // mesma versão de novo enquanto esta ainda está no ar.
        pushedAt.current[character.id] = character.updatedAt

        const write = isNew
          ? createSheet(character, user.userId).then(() => {
              remoteIds.current.add(character.id)
            })
          : saveSheet(character)

        void write.catch((error: unknown) => {
          // Desfaz a marca para a próxima mudança reenviar. Sem isto, uma
          // escrita perdida só voltaria a ser tentada na sessão seguinte.
          if (previousPush === undefined) {
            delete pushedAt.current[character.id]
          } else {
            pushedAt.current[character.id] = previousPush
          }

          setSyncError(`escrita: ${describeError(error)}`)
          setSyncStatus('error')
        })
      }
    }, WRITE_DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
    // `syncStatus` entra como dependencia, nao como trava: e o que faz o
    // efeito rodar de novo quando o pull termina. Quem libera a escrita
    // continua sendo `pulledFor`.
  }, [roster, syncStatus, user, setSyncError, setSyncStatus])
}
