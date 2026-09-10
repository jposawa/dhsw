import { useAtomValue, useSetAtom } from 'jotai'
import React from 'react'
import { Link } from 'react-router-dom'

import { Button, Input, SectionLabel, StepRule } from '@/components'
import { PARTY_NAME_MAX_LENGTH, PARTY_ROLES, ROUTES } from '@/constants'
import { createParty, joinParty } from '@/services'
import { useParties } from '@/hooks'
import { authAtom, toastAtom } from '@/states'

import styles from './Parties.module.css'

const labelForRole = (roleId: string): string =>
  PARTY_ROLES.find((role) => role.id === roleId)?.label ?? roleId

/**
 * Os grupos de jogo deste jogador.
 *
 * Entrar é pelo id do grupo — ele **é** o convite. Ver `services/partyService.ts`.
 */
export const Parties = () => {
  const { user } = useAtomValue(authAtom)
  const { parties, isLoading, refresh } = useParties()
  const setToast = useSetAtom(toastAtom)

  const [newName, setNewName] = React.useState('')
  const [joinCode, setJoinCode] = React.useState('')
  const [isWorking, setIsWorking] = React.useState(false)

  if (!user) {
    return null
  }

  const handleCreate = async () => {
    setIsWorking(true)

    try {
      await createParty(newName.trim(), user.userId)
      setNewName('')
      setToast('Grupo criado')
      refresh()
    } catch {
      setToast('Não foi possível criar o grupo.')
    } finally {
      setIsWorking(false)
    }
  }

  const handleJoin = async () => {
    setIsWorking(true)

    try {
      const party = await joinParty(joinCode.trim(), user.userId)
      setJoinCode('')
      setToast(`Você entrou em ${party.name || 'um grupo'}`)
      refresh()
    } catch {
      setToast('Código não encontrado, ou sem permissão para entrar.')
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <main className={styles.page}>
      <StepRule />

      <SectionLabel detail={isLoading ? 'carregando…' : String(parties.length)}>
        SEUS GRUPOS
      </SectionLabel>

      {parties.length === 0 && !isLoading ? (
        <p className={styles.empty}>
          Nenhum grupo ainda. Crie um para a sua mesa, ou entre com o código que o
          mestre passar.
        </p>
      ) : (
        <ul className={styles.list}>
          {parties.map(({ party, roleId }) => (
            <li className={styles.card} key={party.id}>
              <Link className={styles.open} to={ROUTES.party(party.id)}>
                <b className={styles.name}>{party.name || 'Sem nome'}</b>
                <span className={styles.role}>{labelForRole(roleId)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <SectionLabel>CRIAR GRUPO</SectionLabel>
      <div className={styles.form}>
        <Input
          label="NOME DA MESA"
          value={newName}
          maxLength={PARTY_NAME_MAX_LENGTH}
          placeholder="A mesa de quinta"
          onValueChange={setNewName}
        />
        <Button
          isFullWidth
          disabled={newName.trim().length === 0 || isWorking}
          onClick={() => void handleCreate()}
        >
          CRIAR
        </Button>
      </div>

      <SectionLabel>ENTRAR NUM GRUPO</SectionLabel>
      <div className={styles.form}>
        <Input
          label="CÓDIGO DO GRUPO"
          hint="O Narrador encontra o código na tela do grupo."
          value={joinCode}
          onValueChange={setJoinCode}
        />
        <Button
          isFullWidth
          variant="outline"
          disabled={joinCode.trim().length === 0 || isWorking}
          onClick={() => void handleJoin()}
        >
          ENTRAR
        </Button>
      </div>
    </main>
  )
}
