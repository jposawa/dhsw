import type { BaseComponent } from '@/types'

import styles from './Tag.module.css'

type TagProps = BaseComponent & {
  children: React.ReactNode
  color?: string
}

export const Tag = ({ children, color, className, style }: TagProps) => (
  <span
    className={[styles.tag, className].filter(Boolean).join(' ')}
    style={{ ...style, '--tag-color': color } as React.CSSProperties}
  >
    {children}
  </span>
)
