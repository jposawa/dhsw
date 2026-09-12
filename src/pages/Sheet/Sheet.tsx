import { SectionLabel, Stepper } from "@jposawa/ronin-ui"
import clsx from "clsx"
import { useAtom, useAtomValue } from "jotai"
import React from "react"
import { Navigate, useParams } from "react-router-dom"

import { ANCESTRIES, CLASSES, COMMUNITIES, SUBCLASSES } from "@/compendium"
import { StepRule } from "@/components"
import { MAX_LEVEL, MIN_LEVEL, ROUTES, SHEET_TABS, TRAIT_LIST } from "@/constants"
import { MarkerTrack, SaveState, StatBlock } from "@/fragments"
import { domainColorToken, formatSigned, touchCharacter } from "@/helpers"
import { derive } from "@/rules"
import { houseRulesAtom, rosterAtom, sheetRolesAtom } from "@/states"
import type { Character, SheetTabId } from "@/types"

import styles from "./Sheet.module.css"

/**
 * A ficha. Combate abre primeiro: é a tela usada em 80% do tempo de sessão.
 *
 * Nenhum número aqui é guardado — todos saem de `derive`, e cada `StatBlock`
 * abre mostrando base + modificadores + total.
 *
 * **A ordem da tela é a ordem em que se pergunta.** Quem é — nome, nível,
 * classe — identifica a ficha e vem primeiro; o nível ali em cima porque é a
 * entrada de que metade dos números derivam, e enterrá-lo no rodapé fazia a
 * causa aparecer depois do efeito. Depois o que se consulta quando o dano
 * chega (Evasion, thresholds), depois o que se toca o tempo todo (HP, Stress,
 * Hope), e por último os traços, que se ajustam na criação e quase nunca mais.
 *
 * **Não há botão de salvar, e a ausência é deliberada** — ver `SaveState`.
 */
export const Sheet = () => {
  const { sheetId } = useParams<{ sheetId: string }>()
  const [roster, setRoster] = useAtom(rosterAtom)
  const houseRules = useAtomValue(houseRulesAtom)
  const sheetRoles = useAtomValue(sheetRolesAtom)
  const [tab, setTab] = React.useState<SheetTabId>("combate")

  const character = sheetId ? roster.characters[sheetId] : undefined

  // Papel ausente = ficha local ainda não sincronizada, e ela é sua.
  const isReadOnly = sheetId ? sheetRoles[sheetId] === "reader" : false

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
      ) : (
        <SaveState className={styles.saveState} sheetId={character.id} />
      )}

      {tab !== "combate" ? (
        <p className={styles.note}>
          Aba {activeTab?.label} ainda não implementada. Ver a ordem de entrega em
          DOMAIN.md.
        </p>
      ) : (
        <>
          <StepRule />

          <section className={styles.block}>
            <SectionLabel detail={`Tier ${derived.tier}`}>
              <h2>IDENTIDADE</h2>
            </SectionLabel>

            <div className={styles.identity}>
              <div className={clsx(styles.field, styles.fieldWide)}>
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

              {/* Nível ao lado do nome, e não no rodapé: Evasion, HP, Stress,
                  thresholds e Proficiency saem dele. É entrada, não resumo.
                  Rótulo em <span> porque o Stepper não é um único campo com
                  id — um <label> apontaria para nada, e o leitor de tela já
                  recebe o nome pelas props do próprio componente. */}
              <div className={clsx(styles.field, styles.fieldWide, styles.levelField)}>
                <span className={styles.fieldLabel}>NÍVEL</span>
                <Stepper
                  label="nível"
                  decreaseLabel="Diminuir nível"
                  increaseLabel="Aumentar nível"
                  value={String(derived.level)}
                  canDecrease={derived.level > MIN_LEVEL}
                  canIncrease={derived.level < MAX_LEVEL}
                  onDecrease={() =>
                    update((current) => ({ ...current, level: current.level - 1 }))
                  }
                  onIncrease={() =>
                    update((current) => ({ ...current, level: current.level + 1 }))
                  }
                />
              </div>

              {/* Classe antes de espécie: é ela que move os números. Espécie e
                  origem trazem features, não a base de cálculo. */}
              <div className={styles.field}>
                <label htmlFor="character-class">CLASSE</label>
                <select
                  id="character-class"
                  value={character.className ?? ""}
                  onChange={(event) =>
                    update((current) => ({
                      ...current,
                      className: event.target.value || null,
                      // Subclasse só vale se pertencer à classe: trocar a
                      // classe limpa a escolha em vez de deixar par inválido.
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
                  value={character.subclass ?? ""}
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

              <div className={styles.field}>
                <label htmlFor="character-ancestry">ESPÉCIE</label>
                <select
                  id="character-ancestry"
                  value={character.ancestry ?? ""}
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
                  value={character.community ?? ""}
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
            </div>
          </section>

          <section className={styles.block}>
            <SectionLabel>
              <h2>DEFESA</h2>
            </SectionLabel>

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
              <div className={clsx(styles.thresholdCell, styles.armorCell)}>
                <b className={styles.thresholdValue}>
                  {derived.isBareBones ? "Bare Bones" : derived.equippedArmor?.line}
                </b>
                {derived.equippedArmor
                  ? derived.equippedArmor.name.toUpperCase()
                  : "SEM ARMADURA"}
              </div>
            </div>

            {derived.isBareBones ? (
              <p className={styles.note}>
                Sem armadura vestida: Armor Score 3 + Strength, thresholds{" "}
                {derived.majorThreshold.base}/{derived.severeThreshold.base} + nível. Não é
                erro — é escolha de build.
              </p>
            ) : null}
          </section>

          <section className={styles.block}>
            <SectionLabel>
              <h2>MARCADORES</h2>
            </SectionLabel>

            <div className={styles.tracks}>
              <MarkerTrack
                label="HIT POINTS"
                marked={character.marks.hp}
                max={derived.hitPointsMax.total}
                color={domainColorToken("Havoc")}
                onChange={(hp) =>
                  update((current) => ({ ...current, marks: { ...current.marks, hp } }))
                }
              />
              <MarkerTrack
                label="STRESS"
                marked={character.marks.stress}
                max={derived.stressMax.total}
                color={domainColorToken("Essence")}
                onChange={(stress) =>
                  update((current) => ({ ...current, marks: { ...current.marks, stress } }))
                }
              />
              <MarkerTrack
                label="HOPE"
                marked={character.marks.hope}
                max={6}
                color={domainColorToken("Aegis")}
                onChange={(hope) =>
                  update((current) => ({ ...current, marks: { ...current.marks, hope } }))
                }
              />
              <MarkerTrack
                label="ARMOR SLOTS"
                marked={character.marks.armor}
                max={derived.armorScore.total}
                color={domainColorToken("Edge")}
                onChange={(armor) =>
                  update((current) => ({ ...current, marks: { ...current.marks, armor } }))
                }
              />
            </div>

            {/* Junto dos marcadores porque é o que ele mexe. No rodapé da tela
                seria um botão sem contexto. */}
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
          </section>

          <section className={styles.block}>
            <SectionLabel>
              <h2>TRAÇOS</h2>
            </SectionLabel>

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
          </section>
        </>
      )}
    </main>
  )
}
