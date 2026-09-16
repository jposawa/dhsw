import type React from "react"

import { RuleText } from "@/fragments"
import type { ClassDefinition } from "@/types"

import styles from "./Identity.module.css"

type ClassSummaryProps = {
  classDefinition: ClassDefinition
  /**
   * Na escolha, Evasion, HP e a Hope feature também contam. Na ficha em mesa
   * eles já têm lugar próprio, e repetir aqui só alongaria a coluna.
   */
  isPreview?: boolean
  /** Contador de tokens de uma feature, na ficha em mesa. */
  renderTokens?: (featureName: string) => React.ReactNode
}

export const ClassSummary = ({
  classDefinition,
  isPreview = false,
  renderTokens,
}: ClassSummaryProps) => (
  <section className={styles.summary}>
    {isPreview ? (
      <dl className={styles.stats}>
        <div className={styles.stat}>
          <dt>EVASION</dt>
          <dd>{classDefinition.evasion}</dd>
        </div>
        <div className={styles.stat}>
          <dt>HIT POINTS</dt>
          <dd>{classDefinition.hitPoints}</dd>
        </div>
      </dl>
    ) : null}

    <h5 className={styles.tierLabel}>FEATURES DE CLASSE</h5>
    <ul className={styles.featureList}>
      {classDefinition.features.map((feature) => (
        <li key={feature.name}>
          <RuleText className={styles.featureText} text={`**${feature.name}** — ${feature.text}`} />
          {renderTokens?.(feature.name)}
        </li>
      ))}
    </ul>

    {isPreview ? (
      <>
        <h5 className={styles.tierLabel}>HOPE FEATURE</h5>
        <RuleText className={styles.featureText} text={classDefinition.hopeFeature} />
      </>
    ) : null}
  </section>
)
