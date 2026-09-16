import { RuleText } from "@/fragments"

import styles from "./Identity.module.css"

type OriginFeaturesProps = {
  features: readonly string[]
  /** Texto de ambientação. Só na escolha: em mesa, o que importa é a regra. */
  description?: string
}

/** Features de espécie ou de origem — o dado já traz nome e efeito juntos. */
export const OriginFeatures = ({ features, description }: OriginFeaturesProps) => (
  <section className={styles.summary}>
    {description ? <RuleText className={styles.description} text={description} /> : null}

    <ul className={styles.featureList}>
      {features.map((feature) => (
        <li key={feature}>
          <RuleText className={styles.featureText} text={feature} />
        </li>
      ))}
    </ul>
  </section>
)
