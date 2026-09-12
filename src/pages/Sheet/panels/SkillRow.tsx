import type React from "react"

import { DomainLabel } from "@/components"
import { RuleText } from "@/fragments"
import { domainColorToken } from "@/helpers"
import type { Skill } from "@/types"

import styles from "./SkillRow.module.css"

type SkillRowProps = {
  skill: Skill
  /** O que se faz com esta carta aqui: guardar, equipar, aprender, esquecer. */
  action: React.ReactNode
}

/**
 * Uma carta numa lista da ficha — loadout, vault ou acervo.
 *
 * Mostra o texto inteiro, sem abrir: em mesa a pergunta é "o que esta carta
 * faz", e um passo a mais para descobrir é um passo no meio de um turno. O
 * compêndio é que tem a lista longa e o clique para abrir; aqui são no máximo
 * oito cartas.
 *
 * A ação vem de fora porque muda com o lugar, e é a única diferença entre as
 * três listas — replicar a linha três vezes por causa de um botão faria as três
 * divergirem no primeiro ajuste.
 */
export const SkillRow = ({ skill, action }: SkillRowProps) => (
  <li
    className={styles.row}
    style={{ "--domain-color": domainColorToken(skill.domain) } as React.CSSProperties}
  >
    <div className={styles.head}>
      <div className={styles.text}>
        <h4 className={styles.name}>{skill.name}</h4>
        <DomainLabel domain={skill.domain} level={skill.level} />
      </div>

      <div className={styles.side}>
        <span className={styles.recall} title="Recall Cost">
          ◦{skill.recallCost}
        </span>
        {action}
      </div>
    </div>

    <RuleText className={styles.body} text={skill.text} />
  </li>
)
