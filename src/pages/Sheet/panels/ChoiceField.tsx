import clsx from "clsx"
import type React from "react"

import type { BaseComponent } from "@/types"

import styles from "./Identity.module.css"

type ChoiceFieldProps = BaseComponent & {
  label: string
  value: string | null
  placeholder: string
  detail?: React.ReactNode
  isDisabled?: boolean
  onOpen: () => void
}

/**
 * Um campo que abre uma gaveta, no lugar de um `<select>`.
 *
 * Classe, subclasse, espécie e origem não se escolhem pelo nome: é o que cada
 * uma faz que decide. O select só mostrava o nome; a gaveta mostra as features
 * antes de escolher.
 */
export const ChoiceField = ({
  label,
  value,
  placeholder,
  detail,
  isDisabled = false,
  onOpen,
  className,
  style,
}: ChoiceFieldProps) => (
  <button
    type="button"
    className={clsx(styles.choiceField, className)}
    style={style}
    aria-haspopup="dialog"
    disabled={isDisabled}
    onClick={onOpen}
  >
    <span className={styles.choiceLabel}>{label}</span>
    <span className={styles.choiceValue} data-empty={value === null || undefined}>
      {value ?? placeholder}
      <i className={styles.choiceChevron} aria-hidden="true">
        ›
      </i>
    </span>
    {detail ? <span className={styles.choiceDetail}>{detail}</span> : null}
  </button>
)
