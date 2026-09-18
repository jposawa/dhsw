import { RuleText } from "@/fragments"

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
}

/** Features de espécie ou de origem — o dado já traz nome e efeito juntos. */
export const OriginFeatures = ({ features, sources, description }: OriginFeaturesProps) => (
  <section className={styles.summary}>
    {description ? <RuleText className={styles.description} text={description} /> : null}

    <ul className={styles.featureList}>
      {features.map((feature, index) => (
        <li key={feature}>
          {sources?.[index] ? <p className={styles.optionMeta}>{sources[index]}</p> : null}
          <RuleText className={styles.featureText} text={feature} />
        </li>
      ))}
    </ul>
  </section>
)
