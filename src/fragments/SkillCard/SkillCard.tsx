import clsx from "clsx"
import type React from "react"

import { DomainLabel, DomainSymbol } from "@/components"
import { domainColorToken } from "@/helpers"
import type { BaseComponent, Skill } from "@/types"

import { RuleText } from "../RuleText"

import styles from "./SkillCard.module.css"

type SkillCardProps = BaseComponent & {
  skill: Skill
} & (
    | {
        /** Na grade: texto em prévia, e a carta inteira abre a versão aberta. */
        variant: "closed"
        onOpen: () => void
      }
    | {
        /** No modal: texto inteiro, rolando dentro da carta se não couber. */
        variant: "open"
        onClose: () => void
      }
  )

/**
 * Uma carta de domínio desenhada como carta — **a mesma na grade e aberta**.
 *
 * As duas variantes têm o mesmo esqueleto: nível, domínio e Recall no topo,
 * arte, nome, texto e categoria. Muda a escala e o que o texto faz — prévia
 * cortada na fechada, inteiro na aberta. Dois componentes para isso divergiriam
 * no primeiro ajuste de layout.
 *
 * **A arte tem lugar próprio mesmo sem imagem.** Sem `imageUrl`, o emblema do
 * domínio ocupa o espaço: a carta mantém a forma, e o dia em que a arte chegar
 * ela entra no dado sem mexer no layout.
 *
 * Na fechada, o botão cobre a carta por cima em vez de embrulhá-la: `<button>`
 * não pode conter `<h3>` nem o `<ul>` do texto da regra. Sem rolagem dentro da
 * fechada, de propósito — uma caixa rolável na grade prende a roda do mouse.
 */
export const SkillCard = (props: SkillCardProps) => {
  const { skill, variant, className, style } = props
  const isOpen = variant === "open"
  const Name = isOpen ? "h2" : "h3"

  return (
    <article
      className={clsx(styles.card, className)}
      style={{ "--domain-color": domainColorToken(skill.domain), ...style } as React.CSSProperties}
      data-variant={variant}
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

      <figure className={styles.art}>
        {skill.imageUrl ? (
          <img className={styles.image} src={skill.imageUrl} alt="" loading="lazy" />
        ) : (
          <DomainSymbol className={styles.emblem} domain={skill.domain} />
        )}
      </figure>

      <Name className={styles.name}>{skill.name}</Name>

      <RuleText className={styles.text} text={skill.text} />

      <footer className={styles.footer}>
        <span>{skill.category}</span>
        {props.variant === "open" ? (
          <button type="button" className={styles.close} onClick={props.onClose}>
            FECHAR
          </button>
        ) : null}
      </footer>

      {props.variant === "closed" ? (
        <button
          type="button"
          className={styles.open}
          aria-label={`Abrir ${skill.name}`}
          onClick={props.onOpen}
        />
      ) : null}
    </article>
  )
}
