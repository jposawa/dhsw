import { useAtom, useAtomValue, useSetAtom, useStore } from 'jotai'
import React from 'react'

import { findUnsyncedCharacters, mergeRosters } from '@/helpers'
import { createSheet, fetchSheetsForUser, saveSheet } from '@/services'
import { authAtom, rosterAtom, sheetRolesAtom, syncStatusAtom } from '@/states'
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
 * Por isso o fluxo é: puxa no login, mescla, adota o que só existia local, e
 * daí em diante empurra o que mudar, com debounce. Nunca o contrário — o
 * remoto não manda na sessão.
 */
export const useSheetSync = () => {
  const { status, user } = useAtomValue(authAtom)
  const [roster, setRoster] = useAtom(rosterAtom)
  const [syncStatus, setSyncStatus] = useAtom(syncStatusAtom)
  const setSheetRoles = useSetAtom(sheetRolesAtom)

  // O store lê o roster atual dentro do efeito sem assiná-lo. Assinar faria
  // o pull depender do roster e criaria um laço: puxa, mescla, muda o
  // roster, puxa de novo.
  const store = useStore()

  /** O que o servidor já tem, e em que versão. Evita reescrever o que não mudou. */
  const pushedAt = React.useRef<Record<string, number>>({})
  const syncedUserId = React.useRef<string | null>(null)

  /* ── 1. Puxar e adotar, uma vez por login ────────────────────────────── */

  React.useEffect(() => {
    if (status !== 'signed-in' || !user) {
      syncedUserId.current = null

      return
    }

    if (syncedUserId.current === user.userId) {
      return
    }

    syncedUserId.current = user.userId
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
          pushedAt.current[entry.character.id] = entry.character.updatedAt
        }

        const merged = mergeRosters(
          store.get(rosterAtom),
          remote.map((entry) => entry.character),
        )

        // Fichas criadas antes do login — ou offline — não têm linha de
        // acesso, e sem ela a regra de segurança recusa a escrita. Adotar é
        // criá-las como se fossem novas, com esta conta como autora.
        const orphans = findUnsyncedCharacters(merged, new Set(Object.keys(roles)))

        for (const orphan of orphans) {
          await createSheet(orphan, user.userId)
          roles[orphan.id] = 'author'
          pushedAt.current[orphan.id] = orphan.updatedAt
        }

        if (isCancelled) {
          return
        }

        setRoster(merged)
        setSheetRoles(roles)
        setSyncStatus('ready')
      } catch {
        if (!isCancelled) {
          // Falhar aqui não bloqueia nada: o roster local continua servindo.
          setSyncStatus('error')
        }
      }
    }

    void pull()

    return () => {
      isCancelled = true
    }
  }, [status, user, store, setRoster, setSheetRoles, setSyncStatus])

  /* ── 2. Empurrar o que mudou, com debounce ───────────────────────────── */

  React.useEffect(() => {
    if (syncStatus !== 'ready' || !user) {
      return
    }

    const timer = window.setTimeout(() => {
      for (const character of Object.values(roster.characters)) {
        const lastPushed = pushedAt.current[character.id]

        if (lastPushed === character.updatedAt) {
          continue
        }

        // Ficha que o servidor nunca viu precisa de `createSheet`: é ela que
        // escreve a linha de acesso, e sem linha de acesso a regra de
        // segurança recusa qualquer escrita depois.
        const isNew = lastPushed === undefined

        // Marcado antes de resolver: se a escrita falhar, a próxima mudança
        // reenvia. Marcar depois abriria janela para empurrar duas vezes.
        pushedAt.current[character.id] = character.updatedAt

        void (isNew ? createSheet(character, user.userId) : saveSheet(character)).catch(
          () => setSyncStatus('error'),
        )
      }
    }, WRITE_DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [roster, syncStatus, user, setSyncStatus])
}
