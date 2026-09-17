import clsx from "clsx"

import type { BaseComponent, DieRole } from "@/types"

import styles from "./Die.module.css"

type DieProps = BaseComponent & {
  sides: number
  value: number
  role: DieRole
  isSubtracted?: boolean
}

const ROLE_LABEL: Readonly<Record<DieRole, string>> = {
  hope: "Hope",
  fear: "Fear",
  advantage: "vantagem",
  disadvantage: "desvantagem",
  plain: "",
}

/**
 * Um dado rolado: o valor grande, as faces embaixo.
 *
 * O papel dá a cor — Hope na cor da trilha de Hope da ficha, Fear no perigo —
 * e também vai no nome acessível: cor sozinha não diz qual d12 é qual.
 */
export const Die = ({ sides, value, role, isSubtracted = false, className, style }: DieProps) => {
  const roleLabel = ROLE_LABEL[role]
  const sign = isSubtracted ? "−" : ""

  return (
    <span
      className={clsx(styles.die, className)}
      style={style}
      data-role={role}
      data-subtracted={isSubtracted || undefined}
      role="img"
      aria-label={`d${sides}${roleLabel ? ` de ${roleLabel}` : ""}: ${isSubtracted ? "menos " : ""}${value}`}
    >
      <b className={styles.value}>
        {sign}
        {value}
      </b>
      <span className={styles.sides} aria-hidden="true">
        {roleLabel ? roleLabel.toUpperCase() : `d${sides}`}
      </span>
    </span>
  )
}
