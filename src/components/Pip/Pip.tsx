import clsx from "clsx"

import type { BaseComponent } from "@/types"

import styles from "./Pip.module.css"

type PipProps = BaseComponent & {
  isMarked: boolean
  /** Token de cor, ex.: `var(--color-domain-havoc)`. */
  color?: string
  label: string
  onToggle: () => void
}

export const Pip = ({ isMarked, color, label, onToggle, className, style }: PipProps) => (
  <button
    type="button"
    className={clsx(styles.pip, className)}
    style={{ ...style, "--pip-color": color } as React.CSSProperties}
    aria-pressed={isMarked}
    aria-label={label}
    onClick={onToggle}
  >
    <span className={styles.mark} />
  </button>
)
