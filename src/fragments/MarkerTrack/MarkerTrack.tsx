import { SectionLabel } from "@jposawa/ronin-ui"
import clsx from "clsx"

import { Pip } from "@/components"
import type { BaseComponent } from "@/types"

import styles from "./MarkerTrack.module.css"

type MarkerTrackProps = BaseComponent & {
  label: string
  marked: number
  max: number
  color: string
  /**
   * Mostra `2/6` ao lado do rótulo.
   *
   * Desligado por padrão: os pips **são** a contagem, e repeti-la em número
   * é a mesma informação duas vezes na mesma linha. Fica ligado onde o máximo
   * não é óbvio de olhar — Armor Slots, que muda com a armadura vestida.
   */
  hasCount?: boolean
  /** O que mostrar quando o máximo é zero — sem armadura não há Armor Slot. */
  emptyText?: string
  onChange: (next: number) => void
}

/**
 * Trilha de HP / Stress / Hope / Armor Slots.
 *
 * Tocar o pip N marca até N; tocar o último marcado desmarca ele. Uma batida
 * ajusta o total, não um pip.
 *
 * **A contagem mostrada nunca passa do máximo.** Marca guardada é contagem, e o
 * máximo é derivado: tirar a armadura com 3 slots marcados deixa `armor: 3`
 * guardado sobre um máximo 0. Mostrar "3/0" é mentir sobre a mesa; o toque
 * seguinte grava o valor já dentro do limite.
 */
export const MarkerTrack = ({
  label,
  marked,
  max,
  color,
  hasCount = false,
  emptyText,
  onChange,
  className,
  style,
}: MarkerTrackProps) => {
  const shown = Math.min(marked, max)

  return (
    <div className={clsx(styles.track, className)} style={style}>
      <SectionLabel detail={hasCount ? `${shown}/${max}` : undefined}>{label}</SectionLabel>

      {max === 0 && emptyText ? (
        <p className={styles.empty}>{emptyText}</p>
      ) : (
        <div className={styles.pips}>
          {Array.from({ length: max }, (_, index) => {
            const position = index + 1

            return (
              <Pip
                key={position}
                isMarked={position <= shown}
                color={color}
                label={`${label} ${position} de ${max}`}
                onToggle={() => onChange(position === shown ? position - 1 : position)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
