import type { BaseComponent } from '@/types'

import styles from './Chip.module.css'

type ChipProps = BaseComponent & {
  label: string
  isActive: boolean
  /** Token de cor, ex.: `var(--color-domain-aegis)`. */
  color?: string
  onToggle: () => void
}

export const Chip = ({ label, isActive, color, onToggle, className, style }: ChipProps) => (
  <button
    type="button"
    className={[styles.chip, className].filter(Boolean).join(' ')}
    style={{ ...style, '--chip-color': color } as React.CSSProperties}
    aria-pressed={isActive}
    onClick={onToggle}
  >
    {label}
  </button>
)
