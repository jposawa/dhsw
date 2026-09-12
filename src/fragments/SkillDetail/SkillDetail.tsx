import React from "react"

import { DomainLabel } from "@/components"
import { domainColorToken } from "@/helpers"
import type { Skill } from "@/types"

import { RuleText } from "../RuleText"

import styles from "./SkillDetail.module.css"

type SkillDetailProps = {
  skill: Skill | null
  onClose: () => void
}

/**
 * A carta aberta, com forma de carta: 5:7, moldura, nível e Recall nos cantos.
 *
 * `<dialog>` nativo e não o `Modal` da ronin-ui: o Modal traz cabeçalho, título
 * e moldura próprios, e a carta **é** a moldura. O que o Modal dava de graça —
 * foco preso, Escape, devolver o foco, página inerte — vem do mesmo `<dialog>`.
 *
 * O texto rola dentro da carta quando não cabe. Aqui pode: é a única coisa na
 * tela, e não há página atrás disputando a rolagem.
 */
export const SkillDetail = ({ skill, onClose }: SkillDetailProps) => {
  const dialogRef = React.useRef<HTMLDialogElement>(null)

  React.useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) {
      return
    }

    if (skill && !dialog.open) {
      dialog.showModal()
    }

    if (!skill && dialog.open) {
      dialog.close()
    }
  }, [skill])

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    // O clique no fundo escurecido chega com o próprio <dialog> como alvo.
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-label={skill?.name}
      style={
        skill
          ? ({ "--domain-color": domainColorToken(skill.domain) } as React.CSSProperties)
          : undefined
      }
      onClose={onClose}
      onClick={handleBackdropClick}
    >
      {skill ? (
        <article className={styles.card}>
          <header className={styles.header}>
            <span className={styles.level} aria-label={`Nível ${skill.level}`}>
              {skill.level}
            </span>
            <DomainLabel domain={skill.domain} />
            <span className={styles.recall} aria-label={`Recall ${skill.recallCost}`}>
              ◦{skill.recallCost}
            </span>
          </header>

          <h2 className={styles.name}>{skill.name}</h2>

          <RuleText className={styles.text} text={skill.text} />

          <footer className={styles.footer}>
            <span>{skill.category}</span>
            <button type="button" className={styles.close} onClick={onClose}>
              FECHAR
            </button>
          </footer>
        </article>
      ) : null}
    </dialog>
  )
}
