import { Button, Chip, SectionLabel } from "@jposawa/ronin-ui"
import clsx from "clsx"
import React from "react"
import { LuPlus, LuTrash2 } from "react-icons/lu"

import {
  advancementLabel,
  advancementSlots,
  availableAdvancements,
  createAdvancement,
  picksAvailableFor,
  picksFor,
  slotsFor,
} from "@/helpers"
import type { AdvancementKind, BaseComponent, Character, HouseRules, Level } from "@/types"

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
 * Quem decide o que aparece aqui é `availableAdvancements`: tier, slots do
 * tier e o que sobrou para escolher. A tela não repete nenhuma dessas contas.
 *
 * Os dois avanços que pedem escolha pedem **dois** de cada vez, e é o segundo
 * toque que fecha a compra: um botão de confirmar depois de dois toques seria
 * um terceiro toque para dizer o que os dois já disseram.
 */
export const AdvancementEditor = ({
  draft,
  houseRules,
  onChange,
  className,
  style,
}: AdvancementEditorProps) => {
  const slots = advancementSlots(draft)
  const available = availableAdvancements(draft, houseRules)

  /** O avanço aberto para escolher, e o que já foi apontado nele. */
  const [open, setOpen] = React.useState<AdvancementKind | null>(null)
  const [picked, setPicked] = React.useState<readonly string[]>([])

  const take = (kind: AdvancementKind, details: readonly string[] = []) => {
    onChange((current) => ({
      ...current,
      advancements: [
        ...current.advancements,
        createAdvancement(current.level as Level, kind, details),
      ],
    }))

    setOpen(null)
    setPicked([])
  }

  const undo = (index: number) => {
    onChange((current) => ({
      ...current,
      advancements: current.advancements.filter((_unused, position) => position !== index),
    }))
  }

  /** Avanço que não pede nada entra no toque; o resto abre as escolhas. */
  const start = (kind: AdvancementKind) => {
    if (picksFor(kind) === 0) {
      take(kind)

      return
    }

    setPicked([])
    setOpen(open === kind ? null : kind)
  }

  /** Apontar a última escolha que faltava já compra o avanço. */
  const pick = (kind: AdvancementKind, detail: string) => {
    const next = picked.includes(detail)
      ? picked.filter((candidate) => candidate !== detail)
      : [...picked, detail]

    if (next.length === picksFor(kind)) {
      take(kind, next)

      return
    }

    setPicked(next)
  }

  return (
    <section className={clsx(styles.editor, className)} style={style} aria-label="Avanços">
      <SectionLabel detail={`${slots.spent}/${slots.total}`}>
        <h3>AVANÇOS</h3>
      </SectionLabel>

      {draft.level === 1 && <p className={styles.empty}>Começam no nível 2.</p>}

      {draft.advancements.length > 0 && (
        <ul className={styles.taken}>
          {draft.advancements.map((advancement, index) => (
            <li className={styles.row} key={`${advancement.level}-${advancement.kind}-${index}`}>
              {/* O nível de onde ele veio. Número, porque a coluna é sempre
                  a mesma — o nome por extenso repetiria "nível" em cada linha. */}
              <span className={styles.rowLevel} title={`Nível ${advancement.level}`}>
                {advancement.level}
              </span>

              <span className={styles.rowName}>
                {advancementLabel(advancement.kind)}
                {advancement.details.length > 0 && (
                  <span className={styles.rowDetail}>{advancement.details.join(" · ")}</span>
                )}
              </span>

              <Button
                variant="text"
                intent="danger"
                className={styles.undo}
                aria-label={`Desfazer ${advancementLabel(advancement.kind)}`}
                onClick={() => undo(index)}
              >
                <LuTrash2 aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {draft.level > 1 && slots.remaining > 0 && (
        <ul className={styles.options}>
          {available.map(({ option, remaining }) => (
            <li className={styles.option} key={option.kind} data-open={open === option.kind}>
              <button
                type="button"
                className={styles.optionHead}
                aria-expanded={picksFor(option.kind) === 0 ? undefined : open === option.kind}
                onClick={() => start(option.kind)}
              >
                <span className={styles.optionName}>{option.label}</span>

                {/* Quantos ainda cabem no tier, e o que custa os dois avanços
                    do nível. Números, não frases: a lista tem nove linhas. */}
                {remaining > 1 && (
                  <span className={styles.optionSlots} title={`Cabe ${remaining}× neste tier`}>
                    {remaining}×
                  </span>
                )}
                {slotsFor(option.kind) === 2 && (
                  <span className={styles.optionCost}>custa 2</span>
                )}

                <LuPlus className={styles.optionIcon} aria-hidden="true" />
              </button>

              {open === option.kind && (
                <span className={styles.picks}>
                  {picksAvailableFor(draft, option.kind).map((detail) => (
                    <Chip
                      key={detail}
                      label={detail}
                      isActive={picked.includes(detail)}
                      onToggle={() => pick(option.kind, detail)}
                    />
                  ))}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
