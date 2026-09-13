import clsx from "clsx"
import React from "react"

import type { BaseComponent, Skill } from "@/types"

import { SkillCard } from "../SkillCard"
import { SkillDetail } from "../SkillDetail"

import styles from "./SkillCardGrid.module.css"

type SkillCardGridProps = BaseComponent & {
  skills: readonly Skill[]
  /** Ação por carta, no rodapé dela — "Aprender" na ficha, nada no compêndio. */
  actionFor?: (skill: Skill) => React.ReactNode
}

/**
 * A grade de cartas e a carta aberta, juntas.
 *
 * O compêndio e o "Aprender carta" da ficha mostram cartas do mesmo jeito: duas
 * por fileira no celular, a coluna nascendo com a largura no desktop, e o
 * toque abrindo a carta. A grade e o modal moram aqui para as duas telas não
 * divergirem.
 */
export const SkillCardGrid = ({ skills, actionFor, className, style }: SkillCardGridProps) => {
  const [openedSkill, setOpenedSkill] = React.useState<Skill | null>(null)

  return (
    <>
      <ul className={clsx(styles.grid, className)} style={style} data-testid="compendium-grid">
        {skills.map((skill) => (
          <li className={styles.item} key={skill.name}>
            <SkillCard
              skill={skill}
              variant="closed"
              action={actionFor?.(skill)}
              onOpen={() => setOpenedSkill(skill)}
            />
          </li>
        ))}
      </ul>

      <SkillDetail skill={openedSkill} onClose={() => setOpenedSkill(null)} />
    </>
  )
}
