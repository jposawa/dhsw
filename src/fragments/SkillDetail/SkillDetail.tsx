import React from "react"

import type { Skill } from "@/types"

import { SkillCard } from "../SkillCard"

import styles from "./SkillDetail.module.css"

type SkillDetailProps = {
  skill: Skill | null
  onClose: () => void
}

/**
 * A carta aberta: a mesma `SkillCard` da grade, na variante aberta, dentro de
 * um `<dialog>`.
 *
 * `<dialog>` nativo e não o `Modal` da ronin-ui: o Modal traz cabeçalho, título
 * e moldura próprios, e a carta **é** a moldura. O que o Modal dava de graça —
 * foco preso, Escape, devolver o foco, página inerte — vem do mesmo `<dialog>`.
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
      onClose={onClose}
      onClick={handleBackdropClick}
    >
      {skill ? <SkillCard skill={skill} variant="open" onClose={onClose} /> : null}
    </dialog>
  )
}
