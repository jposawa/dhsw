import { SectionLabel } from "@jposawa/ronin-ui"
import clsx from "clsx"

import { featureFieldsFor } from "@/helpers"
import { useCompendium } from "@/hooks"
import type { BaseComponent, Character } from "@/types"

import styles from "./FeatureNotes.module.css"

type FeatureNotesProps = BaseComponent & {
  character: Character
  /** Ausente em mesa: aí as respostas só se leem. */
  onChange?: (mutate: (current: Character) => Character) => void
}

/**
 * O que as features pedem por escrito — os tenets do Orderborne, e o que mais
 * o compêndio vier a declarar.
 *
 * A feature diz "escolha três" e a ficha não tinha onde guardar os três: a
 * regra ficava como texto que ninguém respondia. Quais campos existem sai de
 * `helpers/featurePrompt.ts`, não daqui.
 *
 * Some inteira na ficha cuja espécie e origem não pedem nada — não é seção
 * fixa, é consequência do que foi escolhido.
 */
export const FeatureNotes = ({ character, onChange, className, style }: FeatureNotesProps) => {
  const { compendium } = useCompendium()
  const fields = featureFieldsFor(character, compendium)

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
    <section className={clsx(styles.notes, className)} style={style} aria-label="Escolhas escritas">
      <SectionLabel detail={fields[0].feature}>
        <h3>ESCOLHAS DA FEATURE</h3>
      </SectionLabel>

      <ul className={styles.list}>
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
                <span className={styles.read}>
                  {character.featureNotes[field.key] || "—"}
                </span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
