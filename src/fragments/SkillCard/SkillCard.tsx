import clsx from "clsx"
import type React from "react"

import { DomainLabel } from "@/components"
import { domainColorToken } from "@/helpers"
import type { BaseComponent, Skill } from "@/types"

import { RuleText } from "../RuleText"

import styles from "./SkillCard.module.css"

type SkillCardProps = BaseComponent & {
  skill: Skill
  /** Abre a carta inteira. A carta toda é o alvo do toque. */
  onOpen: () => void
}

/**
 * Uma carta de domínio desenhada como carta, na grade do compêndio.
 *
 * **Proporção fixa** — a carta física é 5:7 — e o texto é **prévia**: corta com
 * um esmaecido no fim, e o toque abre a carta inteira (`SkillDetail`).
 *
 * Sem rolagem dentro da carta, de propósito. Uma caixa rolável dentro da página
 * rolável captura a roda do mouse e o dedo: passar por cima de uma carta
 * travava a rolagem da grade. E rolar texto numa coluna de metade da tela do
 * celular é pior que ler a carta aberta.
 *
 * O botão cobre a carta por cima em vez de embrulhá-la: `<button>` não pode
 * conter `<h3>` nem o `<ul>` do texto da regra.
 */
export const SkillCard = ({ skill, onOpen, className, style }: SkillCardProps) => (
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

    <button
      type="button"
      className={styles.open}
      aria-label={`Abrir ${skill.name}`}
      onClick={onOpen}
    />
  </article>
)
