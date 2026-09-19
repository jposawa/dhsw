import clsx from "clsx"

import type { BaseComponent, DieRole } from "@/types"

import { DieShape } from "../DieShape"

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
 * Um dado rolado: o valor dentro da silhueta do dado que o deu.
 *
 * A silhueta é a mesma do rolador, e é ela que diz **qual** dado rolou. Numa
 * caixa quadrada para todos, os dois d12 da dualidade liam como d6 — a forma
 * dizia um dado e o rótulo dizia outro.
 *
 * O papel dá a cor — Hope e Fear nas cores deles, vantagem e desvantagem no
 * verde e no laranja — e também vai no nome acessível: cor sozinha não diz
 * qual d12 é qual.
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
      <DieShape className={styles.shape} sides={sides}>
        {sign}
        {value}
      </DieShape>

      <span className={styles.caption} aria-hidden="true">
        {roleLabel ? roleLabel.toUpperCase() : `D${sides}`}
      </span>
    </span>
  )
}
