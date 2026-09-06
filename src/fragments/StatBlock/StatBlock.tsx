import React from 'react'

import { describeModifierSource, formatSigned } from '@/helpers'
import type { BaseComponent, ResolvedStat } from '@/types'

import styles from './StatBlock.module.css'

type StatBlockProps = BaseComponent & {
  label: string
  stat: ResolvedStat
}

/**
 * Valor final + de onde veio cada ponto.
 *
 * Toda caracteristica passa por aqui: base, modificadores nomeados, total.
 * E o que responde "por que minha Evasion e 12?" sem abrir o codigo.
 */
export const StatBlock = ({ label, stat, className, style }: StatBlockProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const hasDetail = stat.modifiers.length > 0

  return (
    <button
      type="button"
      className={[styles.block, className].filter(Boolean).join(' ')}
      style={style}
      aria-expanded={isOpen}
      aria-label={`${label}: ${stat.total}${hasDetail ? '. Toque para ver os modificadores' : ''}`}
      onClick={() => setIsOpen((open) => hasDetail && !open)}
    >
      <span className={styles.summary}>
        <span className={styles.value}>{stat.total}</span>
        <span className={[styles.key, hasDetail ? styles.hasDetail : ''].filter(Boolean).join(' ')}>
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
                className={[styles.lineValue, modifier.value < 0 ? styles.negative : '']
                  .filter(Boolean)
                  .join(' ')}
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
