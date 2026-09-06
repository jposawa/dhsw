import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import React from 'react'

import { Avatar, SectionLabel, StepRule } from '@/components'
import { databaseEnvironment } from '@/lib/firebase'
import { fetchProfile, updateDisplayName } from '@/services'
import { charactersAtom, syncStatusAtom, themeAtom, toastAtom } from '@/states'
import { useAuth } from '@/hooks'

import styles from './Profile.module.css'

const SYNC_LABELS: Record<string, string> = {
  idle: 'não sincronizado',
  pulling: 'sincronizando…',
  ready: 'em dia',
  error: 'falhou',
}

/**
 * Perfil. Alcançado pelo menu da conta, não pela barra inferior — por isso
 * fica fora do catálogo de `appNav.ts`.
 *
 * O que dá para mudar aqui é pouco de propósito: `email` e foto são espelho do
 * Google e não são editáveis, senão deixariam de ser espelho. O nome é o que
 * a mesa vê quando uma ficha for compartilhada, e por isso é seu.
 */
export const Profile = () => {
  const { user, signOut } = useAuth()
  const [theme, setTheme] = useAtom(themeAtom)
  const syncStatus = useAtomValue(syncStatusAtom)
  const characters = useAtomValue(charactersAtom)
  const setToast = useSetAtom(toastAtom)

  const [displayName, setDisplayName] = React.useState('')
  const [savedName, setSavedName] = React.useState('')
  const [isSaving, setIsSaving] = React.useState(false)

  // O nome vem do perfil no banco, não do provedor: é lá que mora o que a
  // pessoa ajustou. O do Google só serve como valor inicial na criação.
  React.useEffect(() => {
    if (!user) {
      return
    }

    let isCancelled = false

    void fetchProfile(user.userId)
      .then((profile) => {
        if (!isCancelled) {
          const current = profile?.displayName ?? user.displayName
          setDisplayName(current)
          setSavedName(current)
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setDisplayName(user.displayName)
          setSavedName(user.displayName)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [user])

  if (!user) {
    return null
  }

  const trimmedName = displayName.trim()
  const canSave = trimmedName.length > 0 && trimmedName !== savedName && !isSaving

  const handleSave = async () => {
    setIsSaving(true)

    try {
      await updateDisplayName(user.userId, trimmedName)
      setSavedName(trimmedName)
      setToast('Nome salvo')
    } catch {
      setToast('Não foi possível salvar o nome.')
    } finally {
      setIsSaving(false)
    }
  }

  const isDark = theme === 'dark'

  return (
    <main className={styles.page}>
      <StepRule />

      <div className={styles.identity}>
        <Avatar src={user.photoUrl} name={savedName || user.displayName} size="md" />
        <span className={styles.identityText}>
          <strong className={styles.name}>{savedName || user.displayName}</strong>
          <span className={styles.email}>{user.email}</span>
        </span>
      </div>

      <SectionLabel>NOME NA MESA</SectionLabel>
      <div className={styles.form}>
        <label className={styles.label} htmlFor="profile-display-name">
          COMO VOCÊ APARECE PARA QUEM COMPARTILHA FICHA
        </label>
        <input
          id="profile-display-name"
          className={styles.input}
          value={displayName}
          maxLength={60}
          onChange={(event) => setDisplayName(event.target.value)}
        />
        <button
          type="button"
          className={styles.action}
          disabled={!canSave}
          onClick={() => void handleSave()}
        >
          {isSaving ? 'SALVANDO…' : 'SALVAR NOME'}
        </button>
      </div>

      <SectionLabel>CONTA</SectionLabel>
      <div className={styles.rows}>
        <div className={styles.row}>
          E-mail
          <span className={styles.rowValue}>{user.email}</span>
        </div>
        <div className={styles.row}>
          Fichas
          <span className={styles.rowValue}>{characters.length}</span>
        </div>
        <div className={styles.row}>
          Sincronização
          <span
            className={[
              styles.rowValue,
              syncStatus === 'error' ? styles.rowValueWarn : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {SYNC_LABELS[syncStatus] ?? syncStatus}
          </span>
        </div>
        <div className={styles.row}>
          Ambiente
          <span className={styles.rowValue}>{databaseEnvironment}</span>
        </div>
      </div>

      <p className={styles.note}>
        E-mail e foto vêm do Google e não são editáveis aqui — deixá-los mudáveis
        faria deles alegação, não espelho da conta.
      </p>

      <SectionLabel>PREFERÊNCIAS</SectionLabel>
      <button
        type="button"
        className={styles.action}
        aria-pressed={isDark}
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
      >
        TEMA — {isDark ? 'ESCURO' : 'CLARO'}
      </button>

      <button
        type="button"
        className={[styles.action, styles.danger].join(' ')}
        onClick={() => void signOut()}
      >
        SAIR DA CONTA
      </button>

      <p className={styles.note}>
        Sair não apaga as fichas deste aparelho — perder o trabalho de quem só
        queria trocar de conta seria pior. Elas voltam a aparecer no próximo login.
      </p>
    </main>
  )
}
