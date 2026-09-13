import clsx from "clsx"

import type { BaseComponent } from "@/types"

import styles from "./StepRule.module.css"

/**
 * Marca de seção: três barras descendentes e o fio.
 *
 * `<hr>`, que é o elemento de divisão, e não uma `div` com filhos: as barras
 * são desenho, e saem do `background` do próprio `<hr>`. Decorativa — fora
 * da árvore de acessibilidade. O espaço em volta é do contêiner (`gap`).
 */
export const StepRule = ({ className, style }: BaseComponent) => (
  <hr className={clsx(styles.rule, className)} style={style} aria-hidden="true" />
)
