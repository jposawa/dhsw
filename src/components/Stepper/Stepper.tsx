import type { BaseComponent } from '@/types'

import styles from './Stepper.module.css'

type StepperProps = BaseComponent & {
  value: string
  label: string
  canDecrease?: boolean
  canIncrease?: boolean
  onDecrease: () => void
  onIncrease: () => void
}

export const Stepper = ({
  value,
  label,
  canDecrease = true,
  canIncrease = true,
  onDecrease,
  onIncrease,
  className,
  style,
}: StepperProps) => (
  <span className={[styles.stepper, className].filter(Boolean).join(' ')} style={style}>
    <button
      type="button"
      className={styles.button}
      disabled={!canDecrease}
      aria-label={`Diminuir ${label}`}
      onClick={onDecrease}
    >
      −
    </button>
    <b className={styles.value}>{value}</b>
    <button
      type="button"
      className={styles.button}
      disabled={!canIncrease}
      aria-label={`Aumentar ${label}`}
      onClick={onIncrease}
    >
      +
    </button>
  </span>
)
