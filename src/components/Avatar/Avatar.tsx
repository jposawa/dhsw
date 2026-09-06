import React from 'react'

import type { BaseComponent } from '@/types'

import styles from './Avatar.module.css'

type AvatarProps = BaseComponent & {
  src: string | null
  name: string
  size?: 'sm' | 'md'
}

const initialsOf = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')

export const Avatar = ({ src, name, size = 'sm', className, style }: AvatarProps) => {
  const [hasFailed, setHasFailed] = React.useState(false)

  // A foto do Google pode 404 depois de a conta trocar de imagem. Cair nas
  // iniciais e melhor que um quadrado quebrado.
  const showImage = Boolean(src) && !hasFailed

  return (
    <span
      className={[styles.avatar, styles[size], className].filter(Boolean).join(' ')}
      style={style}
    >
      {showImage ? (
        <img
          className={styles.image}
          src={src ?? undefined}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setHasFailed(true)}
        />
      ) : (
        <span className={styles.initials} aria-hidden="true">
          {initialsOf(name) || '·'}
        </span>
      )}
    </span>
  )
}
