import { Button, Input, SectionLabel } from "@jposawa/ronin-ui"
import clsx from "clsx"
import React from "react"
import { LuX } from "react-icons/lu"

import { addExperience, removeExperience } from "@/helpers"
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
 * **Nome é a única coisa que se digita aqui.** Quantas Experiences a ficha tem
 * e de quanto é o bônus de cada uma são regra, não campo: o nível concede as
 * vagas (p. 109), toda Experience nasce a +2, e o que a levanta é o avanço
 * "+1 em duas Experiences" — que entra como modificador, ao lado do resto.
 */
export const ExperienceEditor = ({
  character,
  derived,
  onApply,
  className,
  style,
}: ExperienceEditorProps) => {
  const [newExperience, setNewExperience] = React.useState("")

  // Quantas vagas o nível ainda tem abertas. Zero fecha o campo de adicionar:
  // a próxima vem num level achievement, não num toque.
  const faltando = Math.max(derived.expectedExperiences - character.experiences.length, 0)

  const handleAdd = () => {
    onApply(addExperience(character, newExperience))
    setNewExperience("")
  }

  return (
    <section className={clsx(styles.experiences, className)} style={style} aria-label="Experiences">
      <SectionLabel detail={`${character.experiences.length}/${derived.expectedExperiences}`}>
        <h3>EXPERIENCES</h3>
      </SectionLabel>

      <ul className={styles.list}>
        {derived.experiences.map((experience) => (
          <li className={styles.row} key={experience.name}>
            <span className={styles.rowName}>{experience.name}</span>

            {/* O bônus é leitura: a base é o +2 de nascença, e o resto veio de
                avanço. Não há o que ajustar aqui. */}
            <b
              className={styles.bonus}
              title={
                experience.bonus.modifiers.length > 0
                  ? `Base +${experience.bonus.base}, e ${experience.bonus.modifiers.length} de avanço`
                  : undefined
              }
            >
              +{experience.bonus.total}
            </b>

            <Button
              variant="text"
              intent="danger"
              className={styles.remove}
              aria-label={`Remover ${experience.name}`}
              onClick={() => onApply(removeExperience(character, experience.name))}
            >
              <LuX aria-hidden="true" />
            </Button>
          </li>
        ))}

        {/* Uma linha vazia por vaga que o nível concede e ainda não foi usada. */}
        {Array.from({ length: faltando }, (_unused, index) => (
          <li className={styles.slot} key={index}>
            A conceder neste nível
          </li>
        ))}
      </ul>

      {faltando > 0 && (
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
      )}
    </section>
  )
}
