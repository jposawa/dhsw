import type { BaseComponent } from "@/types"

import styles from "./StepRule.module.css"

/** Marca de secao. Puramente decorativa — escondida de leitores de tela. */
export const StepRule = ({ className, style }: BaseComponent) => (
  <div className={[styles.rule, className].filter(Boolean).join(" ")} style={style} aria-hidden="true">
    <i className={styles.bar} />
    <i className={styles.bar} />
    <i className={styles.bar} />
    <b className={styles.line} />
  </div>
)
