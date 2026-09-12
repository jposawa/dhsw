import clsx from "clsx"
import type React from "react"

import { domainColorToken } from "@/helpers"
import type { BaseComponent, Domain } from "@/types"

import { DomainSymbol } from "../DomainSymbol"

import styles from "./DomainLabel.module.css"

type DomainLabelProps = BaseComponent & {
  domain: Domain
  /** Nível da carta, quando o rótulo identifica uma. Vai depois do nome. */
  level?: number
}

/**
 * Emblema + nome do domínio, na cor do domínio.
 *
 * Existe porque o par emblema-mais-nome se repetia em quatro telas do
 * compêndio e em duas da ficha, cada uma remontando o mesmo `inline-flex` com
 * o mesmo `gap`. A cor entra por `--domain-color`: o dado decide a cor, o
 * módulo decide o que fazer com ela — STYLING.md.
 */
export const DomainLabel = ({ className, domain, level, style }: DomainLabelProps) => (
  <span
    className={clsx(styles.label, className)}
    style={{ "--domain-color": domainColorToken(domain), ...style } as React.CSSProperties}
  >
    <DomainSymbol className={styles.symbol} domain={domain} />
    {domain.toUpperCase()}
    {level === undefined ? null : <span className={styles.level}>{level}</span>}
  </span>
)
