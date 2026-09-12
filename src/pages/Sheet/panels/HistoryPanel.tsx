import { Button, Input, SectionLabel, Stepper } from "@jposawa/ronin-ui"
import React from "react"

import { addExperience, removeExperience, setExperienceBonus } from "@/rules"
import type { Character, Result } from "@/types"

import styles from "./HistoryPanel.module.css"

/** Bônus que uma Experience nova nasce valendo. */
const DEFAULT_EXPERIENCE_BONUS = 2

type HistoryPanelProps = {
  character: Character
  isEditing: boolean
  onApply: (result: Result<Character>) => void
  onChange: (mutate: (current: Character) => Character) => void
}

/**
 * Experiences e anotações.
 *
 * **Tudo aqui é progressão, nada é jogada** — por isso a aba inteira só é
 * editável no modo edição, e o que se escreve passa pelo Salvar. Um campo de
 * anotação que grava a cada tecla enche o histórico de versões com meia frase,
 * e é exatamente o tipo de dado que não pode sumir por um toque errado.
 *
 * O bônus não tem teto no código: quantas Experiences a mesa concede, e de
 * quanto, é decisão do Narrador — ver `rules/history.ts`.
 */
export const HistoryPanel = ({
  character,
  isEditing,
  onApply,
  onChange,
}: HistoryPanelProps) => {
  const [newExperience, setNewExperience] = React.useState("")

  const handleAdd = () => {
    onApply(
      addExperience(character, {
        name: newExperience,
        bonus: DEFAULT_EXPERIENCE_BONUS,
      }),
    )
    setNewExperience("")
  }

  return (
    <div className={styles.layout}>
      <section className={styles.experiences}>
        <SectionLabel detail={String(character.experiences.length)}>
          <h3>EXPERIENCES</h3>
        </SectionLabel>

        {character.experiences.length === 0 ? (
          <p className={styles.empty}>
            Nenhuma Experience.{" "}
            {isEditing ? "Adicione abaixo." : "Entre em Editar ficha para adicionar."}
          </p>
        ) : (
          <ul className={styles.list}>
            {character.experiences.map((experience) => (
              <li className={styles.row} key={experience.name}>
                <span className={styles.rowName}>{experience.name}</span>

                {isEditing ? (
                  <div className={styles.rowActions}>
                    <Stepper
                      label={`bônus de ${experience.name}`}
                      decreaseLabel={`Diminuir bônus de ${experience.name}`}
                      increaseLabel={`Aumentar bônus de ${experience.name}`}
                      value={`+${experience.bonus}`}
                      canDecrease={experience.bonus > 1}
                      onDecrease={() =>
                        onApply(
                          setExperienceBonus(character, experience.name, experience.bonus - 1),
                        )
                      }
                      onIncrease={() =>
                        onApply(
                          setExperienceBonus(character, experience.name, experience.bonus + 1),
                        )
                      }
                    />
                    <Button
                      variant="text"
                      intent="danger"
                      aria-label={`Remover ${experience.name}`}
                      onClick={() => onApply(removeExperience(character, experience.name))}
                    >
                      REMOVER
                    </Button>
                  </div>
                ) : (
                  <b className={styles.bonus}>+{experience.bonus}</b>
                )}
              </li>
            ))}
          </ul>
        )}

        {isEditing ? (
          <div className={styles.addRow}>
            <Input
              value={newExperience}
              placeholder="Piloto de corrida, Criado nas ruas…"
              aria-label="Nome da Experience"
              onValueChange={setNewExperience}
            />
            <Button disabled={!newExperience.trim()} onClick={handleAdd}>
              ADICIONAR
            </Button>
          </div>
        ) : null}
      </section>

      <section className={styles.notesBlock}>
        <SectionLabel>
          <h3>ANOTAÇÕES</h3>
        </SectionLabel>

        {isEditing ? (
          <textarea
            className={styles.notes}
            value={character.notes}
            rows={12}
            placeholder="Quem é, de onde veio, com quem tem conta a acertar."
            aria-label="Anotações da ficha"
            onChange={(event) =>
              onChange((current) => ({ ...current, notes: event.target.value }))
            }
          />
        ) : character.notes ? (
          <p className={styles.notesRead}>{character.notes}</p>
        ) : (
          <p className={styles.empty}>
            Sem anotações. Entre em Editar ficha para escrever.
          </p>
        )}
      </section>
    </div>
  )
}
