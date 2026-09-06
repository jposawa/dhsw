import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Link } from 'react-router-dom'

import { CLASSES_BY_NAME } from '@/compendium'
import { SectionLabel, StepRule } from '@/components'
import { ROUTES } from '@/constants'
import { createCharacter, domainColorToken, duplicateCharacter } from '@/helpers'
import { deleteSheet, leaveSheet } from '@/services'
import { authAtom, charactersAtom, rosterAtom, sheetRolesAtom, toastAtom } from '@/states'
import type { Character } from '@/types'

import styles from './Roster.module.css'

const summaryOf = (character: Character): string =>
  [character.ancestry, character.className, character.subclass]
    .filter(Boolean)
    .join(' · ') || 'ficha em branco'

/**
 * Rota raiz, atrás do login. O roster abre primeiro, não a ficha: a maioria
 * tem mais de um personagem, e abrir na última editada é a decisão errada
 * quando não é a que você quer. dh-sw-arquitetura.md §7.
 */
export const Roster = () => {
  const characters = useAtomValue(charactersAtom)
  const [roster, setRoster] = useAtom(rosterAtom)
  const { user } = useAtomValue(authAtom)
  const [sheetRoles, setSheetRoles] = useAtom(sheetRolesAtom)
  const setToast = useSetAtom(toastAtom)

  const addLocally = (character: Character) => {
    setRoster({
      characters: { ...roster.characters, [character.id]: character },
      order: [character.id, ...roster.order],
    })
    // A escrita remota é do `useSheetSync`: ficha que o servidor nunca viu
    // entra por `createSheet`, que é quem cria a linha de acesso junto.
    setSheetRoles({ ...sheetRoles, [character.id]: 'author' })
  }

  const handleCreate = () => {
    addLocally(createCharacter())
  }

  const handleDuplicate = (source: Character) => {
    addLocally(duplicateCharacter(source))
    setToast('Ficha duplicada')
  }

  /**
   * Remover ramifica pelo papel, e a diferença é grande: o autor apaga a
   * ficha para todo mundo; quem só tem acesso sai dela e o dono nem fica
   * sabendo. Apagar só do local traria a ficha de volta no próximo login.
   */
  const handleRemove = (character: Character) => {
    const role = sheetRoles[character.id]
    const isAuthor = role === undefined || role === 'author'

    const remaining = { ...roster.characters }
    delete remaining[character.id]

    const remainingRoles = { ...sheetRoles }
    delete remainingRoles[character.id]

    setRoster({
      characters: remaining,
      order: roster.order.filter((id) => id !== character.id),
    })
    setSheetRoles(remainingRoles)

    if (user) {
      const remove = isAuthor
        ? deleteSheet(character.id)
        : leaveSheet(character.id, user.userId)

      void remove.catch(() => setToast('Removida daqui, mas falhou no servidor.'))
    }

    setToast(isAuthor ? 'Ficha apagada' : 'Você saiu da ficha')
  }

  return (
    <main className={styles.page}>
      <StepRule />
      <SectionLabel>
        {characters.length} {characters.length === 1 ? 'ficha' : 'fichas'}
      </SectionLabel>

      {characters.length === 0 ? (
        <p className={styles.empty}>Nenhuma ficha ainda.</p>
      ) : (
        <ul className={styles.list}>
          {characters.map((character) => {
            const classDefinition = character.className
              ? CLASSES_BY_NAME.get(character.className)
              : undefined
            const color = classDefinition
              ? domainColorToken(classDefinition.domains[0])
              : undefined
            const role = sheetRoles[character.id]
            const isAuthor = role === undefined || role === 'author'

            return (
              <li
                className={styles.card}
                key={character.id}
                style={{ '--domain-color': color } as React.CSSProperties}
              >
                <Link className={styles.open} to={ROUTES.sheet(character.id)}>
                  <span className={styles.level}>{character.level}</span>
                  <span>
                    <b className={styles.name}>{character.name || 'Sem nome'}</b>
                    <span className={styles.summary}>{summaryOf(character)}</span>
                  </span>
                </Link>
                <button
                  type="button"
                  className={styles.action}
                  aria-label={`Duplicar ${character.name || 'ficha sem nome'}`}
                  onClick={() => handleDuplicate(character)}
                >
                  ⧉
                </button>
                <button
                  type="button"
                  className={styles.action}
                  aria-label={
                    isAuthor
                      ? `Apagar ${character.name || 'ficha sem nome'}`
                      : `Sair de ${character.name || 'ficha sem nome'}`
                  }
                  onClick={() => handleRemove(character)}
                >
                  ×
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <button type="button" className={styles.primary} onClick={handleCreate}>
        + &nbsp;NOVA FICHA
      </button>
    </main>
  )
}
