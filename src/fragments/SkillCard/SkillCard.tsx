import clsx from "clsx"
import type React from "react"

import { DomainLabel } from "@/components"
import { domainColorToken } from "@/helpers"
import type { BaseComponent, Skill } from "@/types"

import { RuleText } from "../RuleText"

import styles from "./SkillCard.module.css"

type SkillCardProps = BaseComponent & {
  skill: Skill
}

/**
 * Uma carta de domínio desenhada como carta.
 *
 * **Proporção fixa, e é o ponto do componente.** Uma grade em que cada carta
 * tem a altura do próprio texto não é uma grade de cartas — é uma parede de
 * caixas de tamanhos diferentes. A carta física de Daggerheart é 5:7, e é
 * essa a forma aqui; o texto que não couber rola dentro da própria carta, que
 * mantém a grade regular sem esconder nada.
 *
 * Sem ilustração porque o compêndio não tem arte, e imitar um layout que
 * depende dela daria caixa vazia. O emblema do domínio ocupa esse lugar: é o
 * que identifica a carta de longe, para o que a arte serviria.
 */
export const SkillCard = ({ skill, className, style }: SkillCardProps) => (
  <article
    className={clsx(styles.card, className)}
    style={{ "--domain-color": domainColorToken(skill.domain), ...style } as React.CSSProperties}
    data-testid="compendium-card"
  >
    <header className={styles.header}>
      <span className={styles.level} aria-label={`Nível ${skill.level}`}>
        {skill.level}
      </span>
      <DomainLabel className={styles.domain} domain={skill.domain} />
      <span className={styles.recall} aria-label={`Recall ${skill.recallCost}`}>
        ◦{skill.recallCost}
      </span>
    </header>

    <h3 className={styles.name}>{skill.name}</h3>

    <RuleText className={styles.text} text={skill.text} />

    <footer className={styles.footer}>{skill.category}</footer>
  </article>
)
