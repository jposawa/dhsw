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
  onChange: (next: number) => void
}

/**
 * Trilha de HP / Stress / Armor Slots.
 *
 * Tocar o pip N marca ate N; tocar o ultimo marcado desmarca ele. E o gesto
 * do prototipo, e o certo para o dedo: uma batida ajusta o total, nao um pip.
 */
export const MarkerTrack = ({
  label,
  marked,
  max,
  color,
  hasCount = false,
  onChange,
  className,
  style,
}: MarkerTrackProps) => (
  <div className={clsx(styles.track, className)} style={style}>
    <SectionLabel detail={hasCount ? `${marked}/${max}` : undefined}>{label}</SectionLabel>
    <div className={styles.pips}>
      {Array.from({ length: max }, (_, index) => {
        const position = index + 1

        return (
          <Pip
            key={position}
            isMarked={position <= marked}
            color={color}
            label={`${label} ${position} de ${max}`}
            onToggle={() => onChange(position === marked ? position - 1 : position)}
          />
        )
      })}
    </div>
  </div>
)
