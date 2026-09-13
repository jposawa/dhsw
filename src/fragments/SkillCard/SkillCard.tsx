import clsx from "clsx"
import type React from "react"

import { DomainSymbol } from "@/components"
import { domainColorToken } from "@/helpers"
import type { BaseComponent, Skill } from "@/types"

import { RuleText } from "../RuleText"

import styles from "./SkillCard.module.css"

type SkillCardProps = BaseComponent & {
  skill: Skill
} & (
    | {
        /** Na grade: a carta inteira abre a versão aberta. */
        variant: "closed"
        onOpen: () => void
        /** Ação da lista em que a carta está — "Aprender", por exemplo. */
        action?: React.ReactNode
      }
    | {
        /** No modal. */
        variant: "open"
        onClose: () => void
      }
  )

/**
 * Uma carta de domínio desenhada como carta — **a mesma na grade e aberta**.
 *
 * **Mesma proporção nas duas.** Tudo dentro da carta é medido em `cqi`, fração
 * da largura dela: a aberta é a fechada ampliada, com a arte, o nível, o nome e
 * o texto nas mesmas posições relativas. O único piso é o do texto, que numa
 * carta de meia tela de celular ficaria ilegível se encolhesse junto.
 *
 * **A arte tem lugar próprio mesmo sem imagem.** Sem `imageUrl`, o emblema do
 * domínio ocupa a janela.
 *
 * O texto rola dentro da carta nas duas variantes, e fica **acima** do botão
 * que abre a carta fechada: a roda e o dedo sobre o texto rolam o texto, e o
 * resto da carta abre. Sem `overscroll-behavior`, chegando ao fim do texto a
 * rolagem continua na página — prender ali era o que travava a grade.
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
      <div className={styles.face}>
        <header className={styles.header}>
          <span className={styles.level}>
            <span aria-label={`Nível ${skill.level}`}>{skill.level}</span>
            <DomainSymbol className={styles.levelSymbol} domain={skill.domain} label={skill.domain} />
          </span>
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

        {/* Clique no texto também abre a fechada: a rolagem pelo dedo não gera
            clique, e o botão por cima continua sendo o caminho do teclado. */}
        <div className={styles.text} onClick={props.variant === "closed" ? props.onOpen : undefined}>
          <RuleText className={styles.rule} text={skill.text} />
        </div>

        <footer className={styles.footer}>
          <span>{skill.category}</span>
          {props.variant === "open" ? (
            <button type="button" className={styles.close} onClick={props.onClose}>
              FECHAR
            </button>
          ) : null}
          {props.variant === "closed" && props.action ? (
            <span className={styles.action}>{props.action}</span>
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
      </div>
    </article>
  )
}
