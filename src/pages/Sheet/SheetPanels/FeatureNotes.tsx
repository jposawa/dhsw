import clsx from "clsx"

import { featureFieldsFor } from "@/helpers"
import type { FeatureField } from "@/helpers"
import { useCompendium } from "@/hooks"
import type { BaseComponent, Character } from "@/types"

import styles from "./FeatureNotes.module.css"

type FeatureNotesProps = BaseComponent & {
  character: Character
  /** De qual feature são as linhas. Feature que não pede nada não desenha nada. */
  feature: string
  /** Ausente quando nada aqui se escreve. */
  onChange?: (mutate: (current: Character) => Character) => void
  /**
   * O que dá para escrever com este `onChange`.
   *
   * Em mesa, só `numbers`: o número do `Force Patterns` se escolhe **no
   * descanso longo**, no meio da sessão, e mandar a pessoa entrar em Editar
   * ficha para trocar um dígito é o caminho mais comprido do app. Os campos de
   * texto continuam fora — ditado é história, e história passa pelo Salvar.
   */
  writable?: "all" | "numbers"
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
  writable = "all",
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

  /**
   * Campo numérico: só algarismo, e preso à faixa da feature.
   *
   * A trava é aqui e não num aviso depois: o `Force Patterns` pede um número
   * de 1 a 12, e 13 não é um erro a apontar — é um número que a regra não tem.
   * O vazio atravessa, senão não dá para apagar e redigitar.
   */
  const writeNumber = (field: FeatureField, value: string) => {
    const digits = value.replace(/[^0-9]/g, "").slice(0, 3)

    if (digits === "") {
      write(field.key, "")

      return
    }

    const clamped = Math.min(Math.max(Number(digits), field.min ?? 1), field.max ?? 99)

    write(field.key, String(clamped))
  }

  return (
    <ul className={clsx(styles.list, className)} style={style} aria-label={`Escolhas de ${feature}`}>
      {fields.map((field) => (
        <li className={styles.row} key={field.key}>
          {onChange && (writable === "all" || field.max !== undefined) ? (
            <label className={styles.field}>
              <span className={styles.label}>{field.label.toUpperCase()}</span>
              {field.max === undefined ? (
                <input
                  className={styles.input}
                  value={character.featureNotes[field.key] ?? ""}
                  placeholder="Escreva aqui"
                  maxLength={160}
                  onChange={(event) => write(field.key, event.target.value)}
                />
              ) : (
                <input
                  className={clsx(styles.input, styles.number)}
                  type="text"
                  inputMode="numeric"
                  value={character.featureNotes[field.key] ?? ""}
                  placeholder={`${field.min ?? 1}–${field.max}`}
                  aria-label={`${field.label}, de ${field.min ?? 1} a ${field.max}`}
                  onChange={(event) => writeNumber(field, event.target.value)}
                />
              )}
            </label>
          ) : (
            <span className={styles.field}>
              <span className={styles.label}>{field.label.toUpperCase()}</span>
              <span className={clsx(styles.read, field.max !== undefined && styles.number)}>
                {character.featureNotes[field.key] || "—"}
              </span>
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}
