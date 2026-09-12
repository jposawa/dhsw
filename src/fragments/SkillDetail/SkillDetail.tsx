import { Modal } from "@jposawa/ronin-ui"
import type React from "react"

import { DomainLabel } from "@/components"
import { domainColorToken } from "@/helpers"
import type { Skill } from "@/types"

import { RuleText } from "../RuleText"

import styles from "./SkillDetail.module.css"

type SkillDetailProps = {
  skill: Skill | null
  onClose: () => void
}

/** A carta aberta: o texto inteiro em corpo de leitura, sem corte e sem rolagem interna. */
export const SkillDetail = ({ skill, onClose }: SkillDetailProps) => (
  <Modal isOpen={skill !== null} title={skill?.name ?? ""} onClose={onClose} closeLabel="Fechar">
    {skill ? (
      <article
        className={styles.detail}
        style={{ "--domain-color": domainColorToken(skill.domain) } as React.CSSProperties}
      >
        <header className={styles.meta}>
          <DomainLabel domain={skill.domain} level={skill.level} />
          <span className={styles.facts}>
            {skill.category} · Recall {skill.recallCost}
          </span>
        </header>

        <RuleText text={skill.text} />
      </article>
    ) : null}
  </Modal>
)
