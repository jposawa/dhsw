import { useAtom, useAtomValue } from 'jotai'
import React from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { ANCESTRIES, CLASSES, COMMUNITIES, SUBCLASSES } from '@/compendium'
import { SectionLabel, StepRule, Stepper } from '@/components'
import { MAX_LEVEL, MIN_LEVEL, ROUTES, SHEET_TABS, TRAIT_LIST } from '@/constants'
import { MarkerTrack, StatBlock } from '@/fragments'
import { domainColorToken, formatSigned, touchCharacter } from '@/helpers'
import { derive } from '@/rules'
import { houseRulesAtom, rosterAtom, sheetRolesAtom } from '@/states'
import type { Character, SheetTabId } from '@/types'

import styles from './Sheet.module.css'

/**
 * A ficha. Combate abre primeiro: é a tela usada em 80% do tempo de sessão.
 *
 * Nenhum número aqui é guardado — todos saem de `derive`, e cada `StatBlock`
 * abre mostrando base + modificadores + total.
 */
export const Sheet = () => {
  const { sheetId } = useParams<{ sheetId: string }>()
  const [roster, setRoster] = useAtom(rosterAtom)
  const houseRules = useAtomValue(houseRulesAtom)
  const sheetRoles = useAtomValue(sheetRolesAtom)
  const [tab, setTab] = React.useState<SheetTabId>('combate')

  const character = sheetId ? roster.characters[sheetId] : undefined

  // Papel ausente = ficha local ainda não sincronizada, e ela é sua.
  const isReadOnly = sheetId ? sheetRoles[sheetId] === 'reader' : false

  const update = (mutate: (current: Character) => Character) => {
    if (!character || isReadOnly) {
      // Barrado aqui, num lugar só. Deixar passar gravaria local e falharia
      // no servidor — a regra de segurança recusa escrita de nível 10 — e a
      // pessoa veria a mudança sumir no próximo login, sem explicação.
      return
    }

    const next = touchCharacter(mutate(character))

    setRoster({
      ...roster,
      characters: { ...roster.characters, [next.id]: next },
    })
  }

  if (!character) {
    return <Navigate to={ROUTES.roster} replace />
  }

  const derived = derive(character, houseRules)
  const activeTab = SHEET_TABS.find((sheetTab) => sheetTab.id === tab)

  return (
    <main className={styles.page}>
      <nav className={styles.tabs} aria-label="Seções da ficha">
        {SHEET_TABS.map((sheetTab) => (
          <button
            type="button"
            key={sheetTab.id}
            className={styles.tab}
            aria-current={tab === sheetTab.id}
            onClick={() => setTab(sheetTab.id)}
          >
            {sheetTab.label}
          </button>
        ))}
      </nav>

      {isReadOnly ? (
        <p className={styles.note}>
          Você é leitor desta ficha. Dá para ver tudo; alterações não são salvas.
        </p>
      ) : null}

      {tab !== 'combate' ? (
        <p className={styles.note}>
          Aba {activeTab?.label} ainda não implementada. Ver a ordem de entrega em
          DOMAIN.md.
        </p>
      ) : (
        <>
          <StepRule />

          <div className={styles.identity}>
            <div className={[styles.field, styles.fieldWide].join(' ')}>
              <label htmlFor="character-name">NOME</label>
              <input
                id="character-name"
                value={character.name}
                placeholder="Quem é o personagem"
                onChange={(event) =>
                  update((current) => ({ ...current, name: event.target.value }))
                }
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="character-ancestry">ESPÉCIE</label>
              <select
                id="character-ancestry"
                value={character.ancestry ?? ''}
                onChange={(event) =>
                  update((current) => ({ ...current, ancestry: event.target.value || null }))
                }
              >
                <option value="">—</option>
                {ANCESTRIES.map((ancestry) => (
                  <option key={ancestry.name}>{ancestry.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="character-community">ORIGEM</label>
              <select
                id="character-community"
                value={character.community ?? ''}
                onChange={(event) =>
                  update((current) => ({ ...current, community: event.target.value || null }))
                }
              >
                <option value="">—</option>
                {COMMUNITIES.map((community) => (
                  <option key={community.name}>{community.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="character-class">CLASSE</label>
              <select
                id="character-class"
                value={character.className ?? ''}
                onChange={(event) =>
                  update((current) => ({
                    ...current,
                    className: event.target.value || null,
                    // Subclasse só vale se pertencer à classe: trocar a classe
                    // limpa a escolha em vez de deixar um par inválido.
                    subclass: null,
                  }))
                }
              >
                <option value="">—</option>
                {CLASSES.map((classDefinition) => (
                  <option key={classDefinition.name}>{classDefinition.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="character-subclass">SUBCLASSE</label>
              <select
                id="character-subclass"
                value={character.subclass ?? ''}
                onChange={(event) =>
                  update((current) => ({ ...current, subclass: event.target.value || null }))
                }
              >
                <option value="">—</option>
                {SUBCLASSES.filter(
                  (subclass) =>
                    !character.className || subclass.className === character.className,
                ).map((subclass) => (
                  <option key={subclass.name}>{subclass.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.stats}>
            <StatBlock label="EVASION" stat={derived.evasion} />
            <StatBlock label="PROF" stat={derived.proficiency} />
            <StatBlock label="ARMOR" stat={derived.armorScore} />
            <StatBlock label="MAJOR" stat={derived.majorThreshold} />
          </div>

          <div className={styles.thresholds}>
            <div className={styles.thresholdCell}>
              <b className={styles.thresholdValue}>{derived.severeThreshold.total}</b>
              SEVERE
            </div>
            <div className={styles.thresholdCell}>
              <b className={styles.thresholdValue}>{derived.tier}</b>
              TIER
            </div>
            <div className={[styles.thresholdCell, styles.armorCell].join(' ')}>
              <b className={styles.thresholdValue}>
                {derived.isBareBones ? 'Bare Bones' : derived.equippedArmor?.line}
              </b>
              {derived.equippedArmor
                ? derived.equippedArmor.name.toUpperCase()
                : 'SEM ARMADURA'}
            </div>
          </div>

          {derived.isBareBones ? (
            <p className={styles.note}>
              Sem armadura vestida: Armor Score 3 + Strength, thresholds{' '}
              {derived.majorThreshold.base}/{derived.severeThreshold.base} + nível. Não é
              erro — é escolha de build.
            </p>
          ) : null}

          <SectionLabel>TRAÇOS</SectionLabel>
          <div className={styles.traits}>
            {TRAIT_LIST.map((trait) => {
              const stat = derived.traits[trait]

              return (
                <div className={styles.trait} key={trait}>
                  <span className={styles.traitName}>
                    {trait}
                    {stat.total === stat.base ? null : (
                      <span className={styles.traitTotal}> → {formatSigned(stat.total)}</span>
                    )}
                  </span>
                  <Stepper
                    label={trait}
                    decreaseLabel={`Diminuir ${trait}`}
                    increaseLabel={`Aumentar ${trait}`}
                    value={formatSigned(stat.base)}
                    onDecrease={() =>
                      update((current) => ({
                        ...current,
                        traits: { ...current.traits, [trait]: current.traits[trait] - 1 },
                      }))
                    }
                    onIncrease={() =>
                      update((current) => ({
                        ...current,
                        traits: { ...current.traits, [trait]: current.traits[trait] + 1 },
                      }))
                    }
                  />
                </div>
              )
            })}
          </div>

          <MarkerTrack
            label="HIT POINTS"
            marked={character.marks.hp}
            max={derived.hitPointsMax.total}
            color={domainColorToken('Havoc')}
            onChange={(hp) =>
              update((current) => ({ ...current, marks: { ...current.marks, hp } }))
            }
          />
          <MarkerTrack
            label="STRESS"
            marked={character.marks.stress}
            max={derived.stressMax.total}
            color={domainColorToken('Essence')}
            onChange={(stress) =>
              update((current) => ({ ...current, marks: { ...current.marks, stress } }))
            }
          />
          <MarkerTrack
            label="ARMOR SLOTS"
            marked={character.marks.armor}
            max={derived.armorScore.total}
            color={domainColorToken('Edge')}
            onChange={(armor) =>
              update((current) => ({ ...current, marks: { ...current.marks, armor } }))
            }
          />
          <MarkerTrack
            label="HOPE"
            marked={character.marks.hope}
            max={6}
            color={domainColorToken('Aegis')}
            onChange={(hope) =>
              update((current) => ({ ...current, marks: { ...current.marks, hope } }))
            }
          />

          <button
            type="button"
            className={styles.action}
            onClick={() =>
              update((current) => ({
                ...current,
                marks: { ...current.marks, stress: 0, armor: 0 },
              }))
            }
          >
            DESCANSAR — LIMPAR STRESS E ARMOR SLOTS
          </button>

          <div className={styles.levelRow}>
            <span>NÍVEL</span>
            <Stepper
              label="nível"
              decreaseLabel="Diminuir nível"
              increaseLabel="Aumentar nível"
              value={String(derived.level)}
              canDecrease={derived.level > MIN_LEVEL}
              canIncrease={derived.level < MAX_LEVEL}
              onDecrease={() => update((current) => ({ ...current, level: current.level - 1 }))}
              onIncrease={() => update((current) => ({ ...current, level: current.level + 1 }))}
            />
          </div>
        </>
      )}
    </main>
  )
}
