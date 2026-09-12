import clsx from "clsx"
import React from "react"

import { describeModifierSource, formatSigned } from "@/helpers"
import type { BaseComponent, ResolvedStat } from "@/types"

import styles from "./StatBlock.module.css"

type StatBlockProps = BaseComponent & {
  label: string
  stat: ResolvedStat
  /**
   * Marcas em anel ao redor do valor, uma por ponto.
   *
   * Existe para Proficiency, em que o número **é** uma quantidade de dados que
   * se rola — "3" sozinho não diz isso, e três marcas em volta dizem. É
   * decoração do valor e não informação nova, então sai da árvore de
   * acessibilidade: quem ouve já recebeu o número.
   */
  pipCount?: number
}

/**
 * Valor final + de onde veio cada ponto.
 *
 * Toda caracteristica passa por aqui: base, modificadores nomeados, total.
 * E o que responde "por que minha Evasion e 12?" sem abrir o codigo.
 */
export const StatBlock = ({ label, stat, pipCount, className, style }: StatBlockProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const hasDetail = stat.modifiers.length > 0

  return (
    <button
      type="button"
      className={clsx(styles.block, className)}
      style={style}
      aria-expanded={isOpen}
      aria-label={`${label}: ${stat.total}${hasDetail ? ". Toque para ver os modificadores" : ""}`}
      onClick={() => setIsOpen((open) => hasDetail && !open)}
    >
      <span className={styles.summary}>
        <span className={styles.dial}>
          {pipCount === undefined ? null : (
            <span className={styles.ring} aria-hidden="true">
              {Array.from({ length: pipCount }, (_, index) => (
                <i
                  className={styles.pip}
                  key={index}
                  style={
                    { "--pip-angle": `${(360 / pipCount) * index}deg` } as React.CSSProperties
                  }
                />
              ))}
            </span>
          )}
          <span className={styles.value}>{stat.total}</span>
        </span>
        <span className={clsx(styles.key, hasDetail && styles.hasDetail)}>
          {label}
        </span>
      </span>

      {isOpen ? (
        <span className={styles.detail}>
          <span className={styles.line}>
            <span>base</span>
            <span className={styles.lineValue}>{stat.base}</span>
          </span>
          {stat.modifiers.map((modifier, index) => (
            <span className={styles.line} key={`${modifier.source.kind}-${index}`}>
              <span>{describeModifierSource(modifier)}</span>
              <span
                className={clsx(styles.lineValue, modifier.value < 0 && styles.negative)}
              >
                {formatSigned(modifier.value)}
              </span>
            </span>
          ))}
        </span>
      ) : null}
    </button>
  )
}
