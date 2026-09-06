import { Pip, SectionLabel } from '@/components'
import type { BaseComponent } from '@/types'

import styles from './MarkerTrack.module.css'

type MarkerTrackProps = BaseComponent & {
  label: string
  marked: number
  max: number
  color: string
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
  onChange,
  className,
  style,
}: MarkerTrackProps) => (
  <div className={[styles.track, className].filter(Boolean).join(' ')} style={style}>
    <SectionLabel detail={`${marked}/${max}`}>{label}</SectionLabel>
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
