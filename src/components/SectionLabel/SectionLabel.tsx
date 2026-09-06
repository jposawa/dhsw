import type { BaseComponent } from '@/types'

import styles from './SectionLabel.module.css'

type SectionLabelProps = BaseComponent & {
  children: React.ReactNode
  detail?: string
}

export const SectionLabel = ({ children, detail, className, style }: SectionLabelProps) => (
  <div className={[styles.label, className].filter(Boolean).join(' ')} style={style}>
    {children}
    {detail ? <span className={styles.count}> {detail}</span> : null}
  </div>
)
