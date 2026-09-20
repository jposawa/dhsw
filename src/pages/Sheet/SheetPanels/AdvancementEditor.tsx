import { Button, SectionLabel } from "@jposawa/ronin-ui"
import clsx from "clsx"
import { LuTrash2 } from "react-icons/lu"

import { ADVANCEMENT_OPTIONS, DOMAIN_LIST, TRAIT_LIST } from "@/constants"
import { advancementSlots, canMulticlass, createAdvancement, slotsFor } from "@/helpers"
import type {
  AdvancementKind,
  BaseComponent,
  Character,
  HouseRules,
  Level,
} from "@/types"

import styles from "./AdvancementEditor.module.css"

type AdvancementEditorProps = BaseComponent & {
  draft: Character
  houseRules: HouseRules
  onChange: (mutate: (current: Character) => Character) => void
}

/**
 * Os avanços de nível: o que já foi escolhido e o que ainda cabe.
 *
 * **Subir o nível não muda número nenhum sozinho.** Ele dá dois avanços, e é
 * escolher o que fazer com eles que move a ficha — por isso o stepper de nível
 * não mexe em atributo, HP ou Evasion, e esta lista é o único lugar em que
 * isso acontece.
 *
 * Cada avanço guarda o que move (`changes`), então o histórico explica de onde
 * veio cada número — e um avanço de regra da casa entra aqui sem tocar na
 * matemática. Ver `helpers/advancement.ts`.
 */
export const AdvancementEditor = ({
  draft,
  houseRules,
  onChange,
  className,
  style,
}: AdvancementEditorProps) => {
  const slots = advancementSlots(draft)

  const podeMulticlasse = canMulticlass(draft.level, houseRules)

  const comprar = (kind: AdvancementKind, detail = "") => {
    onChange((current) => ({
      ...current,
      advancements: [
        ...current.advancements,
        createAdvancement(current.level as Level, kind, detail),
      ],
    }))
  }

  const devolver = (index: number) => {
    onChange((current) => ({
      ...current,
      advancements: current.advancements.filter((_unused, posicao) => posicao !== index),
    }))
  }

  /** As escolhas que um avanço ainda pede, quando o tipo não basta. */
  const detalhesDe = (kind: AdvancementKind): readonly string[] => {
    if (kind === "trait") {
      return TRAIT_LIST
    }

    return kind === "multiclass" ? DOMAIN_LIST : []
  }

  const disponiveis = ADVANCEMENT_OPTIONS.filter((option) => {
    if (slotsFor(option.kind) > slots.remaining) {
      return false
    }

    return option.kind === "multiclass" ? podeMulticlasse : true
  })

  return (
    <section className={clsx(styles.editor, className)} style={style} aria-label="Avanços">
      <SectionLabel detail={`${slots.spent}/${slots.total}`}>
        <h3>AVANÇOS</h3>
      </SectionLabel>

      {draft.level === 1 ? (
        <p className={styles.empty}>
          O nível 1 é a criação: os avanços começam no nível 2, dois por nível.
        </p>
      ) : (
        <>
          {draft.advancements.length > 0 && (
            <ul className={styles.taken}>
              {draft.advancements.map((advancement, index) => (
                <li className={styles.row} key={`${advancement.level}-${advancement.kind}-${index}`}>
                  <span className={styles.rowText}>
                    <b className={styles.rowName}>
                      {labelOf(advancement.kind)}
                      {advancement.detail && ` · ${advancement.detail}`}
                    </b>
                    <span className={styles.rowMeta}>
                      Nível {advancement.level} · {advancement.slotsSpent === 2 ? "dois" : "um"}
                    </span>
                  </span>

                  <Button
                    variant="outline"
                    intent="danger"
                    className={styles.remove}
                    aria-label={`Desfazer ${labelOf(advancement.kind)}`}
                    onClick={() => devolver(index)}
                  >
                    <LuTrash2 />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          {slots.remaining === 0 ? (
            <p className={styles.empty}>Todos os avanços deste nível estão escolhidos.</p>
          ) : (
            <>
              <p className={styles.hint}>
                {slots.remaining === 1 ? "Falta 1 avanço" : `Faltam ${slots.remaining} avanços`}.
              </p>

              <ul className={styles.options}>
                {disponiveis.map((option) => {
                  const detalhes = detalhesDe(option.kind)

                  return (
                    <li className={styles.option} key={option.kind}>
                      <span className={styles.optionName}>
                        {option.label}
                        {slotsFor(option.kind) === 2 && (
                          <span className={styles.optionCost}> · custa dois</span>
                        )}
                      </span>

                      {detalhes.length === 0 ? (
                        <Button variant="outline" onClick={() => comprar(option.kind)}>
                          ESCOLHER
                        </Button>
                      ) : (
                        <span className={styles.details}>
                          {detalhes.map((detalhe) => (
                            <Button
                              className={styles.detail}
                              variant="outline"
                              key={detalhe}
                              onClick={() => comprar(option.kind, detalhe)}
                            >
                              {detalhe}
                            </Button>
                          ))}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </>
      )}
    </section>
  )
}

const labelOf = (kind: AdvancementKind): string =>
  ADVANCEMENT_OPTIONS.find((option) => option.kind === kind)?.label ?? kind
