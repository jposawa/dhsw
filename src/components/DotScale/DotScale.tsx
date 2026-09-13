import clsx from "clsx"

import type { BaseComponent } from "@/types"

import styles from "./DotScale.module.css"

type DotScaleProps = BaseComponent & {
  label: string
  value: number
  max: number
}

/**
 * Uma escala de bolinhas, cheias até o valor — os círculos de Proficiency da
 * ficha do livro. Só leitura: o número muda por nível e advancement, nunca
 * por toque.
 */
export const DotScale = ({ label, value, max, className, style }: DotScaleProps) => (
  <span
    className={clsx(styles.scale, className)}
    style={style}
    role="img"
    aria-label={`${label}: ${value} de ${max}`}
  >
    {Array.from({ length: max }, (_, index) => (
      <i className={clsx(styles.dot, index < value && styles.filled)} key={index} />
    ))}
  </span>
)
