import clsx from "clsx"

import { featureFieldsFor } from "@/helpers"
import { useCompendium } from "@/hooks"
import type { BaseComponent, Character } from "@/types"

import styles from "./FeatureNotes.module.css"

type FeatureNotesProps = BaseComponent & {
  character: Character
  /** De qual feature são as linhas. Feature que não pede nada não desenha nada. */
  feature: string
  /** Ausente em mesa: aí as respostas só se leem. */
  onChange?: (mutate: (current: Character) => Character) => void
}

/**
 * O que **uma** feature pede por escrito — os tenets do Orderborne, e o que
 * mais o compêndio vier a declarar.
 *
 * A feature diz "escolha três" e a ficha não tinha onde guardar os três: a
 * regra ficava como texto que ninguém respondia. Quais campos existem sai de
 * `helpers/featurePrompt.ts`, não daqui.
 *
 * **Sem título próprio, porque não é seção.** As respostas pertencem à feature
 * que as pediu e moram dentro dela: na carta dela em mesa, no grupo dela na
 * edição. Soltas no meio da ficha, entre as Experiences e o equipamento, eram
 * três campos sem dono — ninguém lia "Ditado 1" e pensava em Orderborne.
 */
export const FeatureNotes = ({
  character,
  feature,
  onChange,
  className,
  style,
}: FeatureNotesProps) => {
  const { compendium } = useCompendium()
  const fields = featureFieldsFor(character, compendium).filter(
    (field) => field.feature === feature,
  )

  if (fields.length === 0) {
    return null
  }

  const write = (key: string, value: string) => {
    onChange?.((current) => ({
      ...current,
      featureNotes: { ...current.featureNotes, [key]: value },
    }))
  }

  return (
    <ul className={clsx(styles.list, className)} style={style} aria-label={`Escolhas de ${feature}`}>
      {fields.map((field) => (
        <li className={styles.row} key={field.key}>
          {onChange ? (
            <label className={styles.field}>
              <span className={styles.label}>{field.label.toUpperCase()}</span>
              <input
                className={styles.input}
                value={character.featureNotes[field.key] ?? ""}
                placeholder="Escreva aqui"
                maxLength={160}
                onChange={(event) => write(field.key, event.target.value)}
              />
            </label>
          ) : (
            <span className={styles.field}>
              <span className={styles.label}>{field.label.toUpperCase()}</span>
              <span className={styles.read}>{character.featureNotes[field.key] || "—"}</span>
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}
