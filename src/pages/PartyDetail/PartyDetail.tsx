import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import React from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import { CLASSES_BY_NAME } from '@/compendium'
import { Avatar, Button, SectionLabel, StepRule } from '@/components'
import { PARTY_ROLES, ROUTES } from '@/constants'
import { domainColorToken, touchCharacter } from '@/helpers'
import {
  fetchParty,
  fetchPartyMembers,
  fetchPartySheets,
  fetchProfile,
  leaveParty,
  setSheetParty,
} from '@/services'
import { authAtom, charactersAtom, rosterAtom, toastAtom } from '@/states'
import type { Character, Party, PartyMemberView } from '@/types'

import styles from './PartyDetail.module.css'

const labelForRole = (roleId: string): string =>
  PARTY_ROLES.find((role) => role.id === roleId)?.label ?? roleId

/**
 * Um grupo: quem está nele, quais fichas estão nele, e o código do convite.
 *
 * As fichas da party são lidas **sob demanda** e nunca entram no roster local.
 * Se entrassem, a sincronização passaria a empurrar ficha de outra pessoa como
 * se fosse sua — e a regra de segurança recusaria, em silêncio, para sempre.
 */
export const PartyDetail = () => {
  const { partyId } = useParams<{ partyId: string }>()
  const { user } = useAtomValue(authAtom)
  const [roster, setRoster] = useAtom(rosterAtom)
  const myCharacters = useAtomValue(charactersAtom)
  const setToast = useSetAtom(toastAtom)
  const navigate = useNavigate()

  const [party, setParty] = React.useState<Party | null>(null)
  const [members, setMembers] = React.useState<PartyMemberView[]>([])
  const [sheets, setSheets] = React.useState<Character[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    if (!partyId) {
      return
    }

    let isCancelled = false

    const load = async () => {
      try {
        const [loadedParty, loadedMembers, loadedSheets] = await Promise.all([
          fetchParty(partyId),
          fetchPartyMembers(partyId),
          fetchPartySheets(partyId),
        ])

        // O nome de cada membro vem do perfil; sem isso a lista mostraria uid.
        const views = await Promise.all(
          loadedMembers.map(async (member) => {
            const profile = await fetchProfile(member.userId).catch(() => null)

            return {
              member,
              displayName: profile?.displayName ?? 'Jogador',
              photoUrl: profile?.photoUrl ?? null,
            }
          }),
        )

        if (!isCancelled) {
          setParty(loadedParty)
          setMembers(views)
          setSheets(loadedSheets)
        }
      } catch {
        if (!isCancelled) {
          setToast('Não foi possível carregar o grupo.')
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      isCancelled = true
    }
  }, [partyId, setToast])

  if (!partyId || !user) {
    return <Navigate to={ROUTES.parties} replace />
  }

  const myRole = members.find((view) => view.member.userId === user.userId)?.member
  const sheetsInParty = new Set(sheets.map((sheet) => sheet.id))
  const addableSheets = myCharacters.filter((character) => !sheetsInParty.has(character.id))

  const handleAddSheet = async (character: Character) => {
    try {
      await setSheetParty(character.id, partyId, character.partyId)

      // O campo local acompanha: é ele que a ficha mostra, e a sincronização
      // já vai empurrar a mudança junto com o resto.
      setRoster({
        ...roster,
        characters: {
          ...roster.characters,
          [character.id]: touchCharacter({ ...character, partyId }),
        },
      })
      setSheets((current) => [...current, { ...character, partyId }])
      setToast('Ficha adicionada ao grupo')
    } catch {
      setToast('Não foi possível adicionar a ficha.')
    }
  }

  const handleLeave = async () => {
    try {
      await leaveParty(partyId, user.userId)
      setToast('Você saiu do grupo')
      void navigate(ROUTES.parties)
    } catch {
      setToast('Não foi possível sair do grupo.')
    }
  }

  return (
    <main className={styles.page}>
      <StepRule />

      <h2 className={styles.title}>{party?.name ?? (isLoading ? 'Carregando…' : 'Grupo')}</h2>

      <SectionLabel detail={String(members.length)}>MEMBROS</SectionLabel>
      <ul className={styles.list}>
        {members.map(({ member, displayName, photoUrl }) => (
          <li className={styles.row} key={member.userId}>
            <Avatar imageUrl={photoUrl ?? undefined} name={displayName} />
            <span className={styles.rowText}>
              <b className={styles.rowName}>{displayName}</b>
              <span className={styles.rowMeta}>{labelForRole(member.roleId)}</span>
            </span>
          </li>
        ))}
      </ul>

      <SectionLabel detail={String(sheets.length)}>FICHAS DO GRUPO</SectionLabel>
      {sheets.length === 0 ? (
        <p className={styles.empty}>Nenhuma ficha no grupo ainda.</p>
      ) : (
        <ul className={styles.list}>
          {sheets.map((sheet) => {
            const classDefinition = sheet.className
              ? CLASSES_BY_NAME.get(sheet.className)
              : undefined

            return (
              <li
                className={styles.row}
                key={sheet.id}
                style={
                  {
                    '--domain-color': classDefinition
                      ? domainColorToken(classDefinition.domains[0])
                      : undefined,
                  } as React.CSSProperties
                }
              >
                <span className={styles.level}>{sheet.level}</span>
                <span className={styles.rowText}>
                  <b className={styles.rowName}>{sheet.name || 'Sem nome'}</b>
                  <span className={styles.rowMeta}>
                    {[sheet.ancestry, sheet.className].filter(Boolean).join(' · ') ||
                      'ficha em branco'}
                  </span>
                </span>
              </li>
            )
          })}
        </ul>
      )}

      {addableSheets.length > 0 ? (
        <>
          <SectionLabel>PÔR UMA FICHA SUA NO GRUPO</SectionLabel>
          <div className={styles.actions}>
            {addableSheets.map((character) => (
              <Button
                key={character.id}
                isFullWidth
                variant="outline"
                onClick={() => void handleAddSheet(character)}
              >
                + &nbsp;{character.name || 'Sem nome'}
              </Button>
            ))}
          </div>
        </>
      ) : null}

      <SectionLabel>CÓDIGO DO GRUPO</SectionLabel>
      <p className={styles.code}>{partyId}</p>
      <p className={styles.note}>
        Quem tem este código entra no grupo e passa a ver as fichas dele. Ele não
        expira e não dá para revogar — trate como o link de uma ficha.
      </p>

      <div className={styles.actions}>
        <Button
          isFullWidth
          variant="outline"
          intent="danger"
          disabled={!myRole}
          onClick={() => void handleLeave()}
        >
          SAIR DO GRUPO
        </Button>
      </div>
    </main>
  )
}
