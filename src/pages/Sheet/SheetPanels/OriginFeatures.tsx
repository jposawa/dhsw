import type React from "react"

import { RuleText } from "@/fragments"
import { featureNameOf } from "@/helpers"

import styles from "./Identity.module.css"

type OriginFeaturesProps = {
  features: readonly string[]
  /**
   * De onde veio cada feature, na mesma ordem. Só na ascendência mista, em que
   * elas vêm de espécies diferentes e a ficha precisa dizer qual é qual.
   */
  sources?: readonly string[]
  /** Texto de ambientação. Só na escolha: em mesa, o que importa é a regra. */
  description?: string
  /**
   * O que a feature pede por escrito, pelo nome dela — os tenets do
   * Orderborne. Embaixo do texto que os pede, e não numa seção à parte: a
   * resposta é da feature. Ver `FeatureNotes`.
   */
  renderNotes?: (featureName: string) => React.ReactNode
}

/** Features de espécie ou de origem — o dado já traz nome e efeito juntos. */
export const OriginFeatures = ({
  features,
  sources,
  description,
  renderNotes,
}: OriginFeaturesProps) => (
  <section className={styles.summary}>
    {!!description && <RuleText className={styles.description} text={description} />}

    <ul className={styles.featureList}>
      {features.map((feature, index) => (
        <li key={feature}>
          {!!sources?.[index] && <p className={styles.optionMeta}>{sources[index]}</p>}
          <RuleText className={styles.featureText} text={feature} />
          {renderNotes?.(featureNameOf(feature) ?? "")}
        </li>
      ))}
    </ul>
  </section>
)
