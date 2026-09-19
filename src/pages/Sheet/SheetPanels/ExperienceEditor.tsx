import { Button, Input, SectionLabel, Stepper } from "@jposawa/ronin-ui"
import clsx from "clsx"
import React from "react"

import { NEW_EXPERIENCE_BONUS } from "@/constants"
import { addExperience, removeExperience, setExperienceBonus } from "@/helpers"
import type { BaseComponent, Character, DerivedStats, Result } from "@/types"

import styles from "./ExperienceEditor.module.css"

type ExperienceEditorProps = BaseComponent & {
  character: Character
  derived: DerivedStats
  onApply: (result: Result<Character>) => void
}

/**
 * As Experiences, no modo edição da aba principal.
 *
 * Elas moram aqui e não em História porque é em mesa que se usam — gastar uma
 * Hope para somar o bônus acontece no meio de um teste, e a lista aparece ao
 * lado dos atributos no modo jogo. Editar do outro lado da ficha separava a
 * lista de onde ela é lida.
 *
 * Nada aqui é jogada: acrescentar Experience e mexer no bônus são progressão,
 * e passam pelo Salvar como o resto da edição.
 *
 * O bônus não tem teto no código: quantas a mesa concede, e de quanto, é
 * decisão do Narrador — ver `rules/history.ts`.
 */
export const ExperienceEditor = ({
  character,
  derived,
  onApply,
  className,
  style,
}: ExperienceEditorProps) => {
  const [newExperience, setNewExperience] = React.useState("")

  // Quantas o nível ainda concede. Nunca negativo: a mesa pode conceder mais
  // do que o livro, e isso não é erro a apontar.
  const faltando = Math.max(derived.expectedExperiences - character.experiences.length, 0)

  const handleAdd = () => {
    onApply(addExperience(character, { name: newExperience, bonus: NEW_EXPERIENCE_BONUS }))
    setNewExperience("")
  }

  return (
    <section className={clsx(styles.experiences, className)} style={style} aria-label="Experiences">
      <SectionLabel detail={`${character.experiences.length}/${derived.expectedExperiences}`}>
        <h3>EXPERIENCES</h3>
      </SectionLabel>

      {character.experiences.length === 0 && faltando === 0 ? (
        <p className={styles.empty}>Nenhuma Experience. Adicione abaixo.</p>
      ) : (
        <ul className={styles.list}>
          {character.experiences.map((experience) => (
            <li className={styles.row} key={experience.name}>
              <span className={styles.rowName}>{experience.name}</span>

              <div className={styles.rowActions}>
                <Stepper
                  label={`bônus de ${experience.name}`}
                  decreaseLabel={`Diminuir bônus de ${experience.name}`}
                  increaseLabel={`Aumentar bônus de ${experience.name}`}
                  value={`+${experience.bonus}`}
                  canDecrease={experience.bonus > 1}
                  onDecrease={() =>
                    onApply(setExperienceBonus(character, experience.name, experience.bonus - 1))
                  }
                  onIncrease={() =>
                    onApply(setExperienceBonus(character, experience.name, experience.bonus + 1))
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
            </li>
          ))}

          {/* Uma linha vazia por Experience que o nível ainda concede: o
              número no rótulo diz quantas faltam, e a linha diz onde. */}
          {Array.from({ length: faltando }, (_unused, index) => (
            <li className={styles.slot} key={index}>
              A conceder neste nível
            </li>
          ))}
        </ul>
      )}

      <form
        className={styles.addRow}
        onSubmit={(event) => {
          event.preventDefault()
          handleAdd()
        }}
      >
        <Input
          value={newExperience}
          placeholder="Piloto de corrida, Criado nas ruas…"
          aria-label="Nome da Experience"
          onValueChange={setNewExperience}
        />
        <Button type="submit" disabled={!newExperience.trim()}>
          ADICIONAR
        </Button>
      </form>
    </section>
  )
}
