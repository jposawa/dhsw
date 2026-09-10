import { useAtom, useAtomValue } from 'jotai'
import React from 'react'
import { Link } from 'react-router-dom'

import { Avatar, NavIcon, Switch } from '@/components'
import { ROUTES } from '@/constants'
import { useAuth } from '@/hooks'
import { charactersAtom, syncStatusAtom, themeAtom } from '@/states'

import styles from './UserMenu.module.css'

const SYNC_LABELS: Record<string, string> = {
  idle: 'não sincronizado',
  pulling: 'sincronizando…',
  ready: 'em dia',
  error: 'falhou',
}

/**
 * Conta: gatilho na barra inferior, painel com prévia e ações rápidas.
 *
 * Deslogado, **o gatilho é o botão de entrar** — não abre painel. Isso não é
 * só economia de toque: `signInWithPopup` precisa sair de um clique direto,
 * senão o navegador bloqueia o pop-up (`services/authService.ts`).
 */
export const UserMenu = ({ isNavCollapsed = false }: { isNavCollapsed?: boolean }) => {
  const { status, user, signIn, signOut } = useAuth()
  const [theme, setTheme] = useAtom(themeAtom)
  const syncStatus = useAtomValue(syncStatusAtom)
  const characters = useAtomValue(charactersAtom)

  const [isOpen, setIsOpen] = React.useState(false)
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  const close = React.useCallback(() => {
    setIsOpen(false)
  }, [])

  React.useEffect(() => {
    if (!isOpen) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        close()
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close()
        // Devolve o foco ao gatilho: fechar com Escape e perder o foco no
        // corpo do documento deixa quem usa teclado sem lugar.
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, close])

  if (status === 'unknown') {
    return (
      <div className={styles.wrapper}>
        <span className={[styles.trigger, styles.placeholder].join(' ')}>
          <i className={[styles.triggerSlot, styles.triggerIcon].join(' ')} aria-hidden="true">
            <NavIcon name="account" />
          </i>
          <span className={styles.triggerLabel}>CONTA</span>
        </span>
      </div>
    )
  }

  if (status === 'signed-out' || !user) {
    return (
      <div className={styles.wrapper}>
        <button
          type="button"
          className={styles.trigger}
          title={isNavCollapsed ? 'Entrar' : undefined}
          aria-label={isNavCollapsed ? 'Entrar' : undefined}
          onClick={() => void signIn()}
        >
          <i className={[styles.triggerSlot, styles.triggerIcon].join(' ')} aria-hidden="true">
            <NavIcon name="account" />
          </i>
          <span className={styles.triggerLabel}>ENTRAR</span>
        </button>
      </div>
    )
  }

  const isDark = theme === 'dark'

  return (
    <div className={styles.wrapper} ref={wrapperRef} data-collapsed={isNavCollapsed}>
      <button
        type="button"
        ref={triggerRef}
        className={styles.trigger}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`Conta de ${user.displayName}`}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className={styles.triggerSlot}>
          <Avatar imageUrl={user.photoUrl ?? undefined} name={user.displayName} size="sm" />
        </span>
        <span className={styles.triggerLabel}>CONTA</span>
      </button>

      {isOpen ? (
        <section className={styles.panel} aria-label="Conta">
          <header className={styles.identity}>
            <Avatar imageUrl={user.photoUrl ?? undefined} name={user.displayName} size="md" />
            <span className={styles.identityText}>
              <strong className={styles.identityName}>{user.displayName}</strong>
              <span className={styles.identityEmail}>{user.email}</span>
            </span>
          </header>

          <div className={styles.preview}>
            <span className={styles.previewRow}>
              Fichas
              <b className={styles.previewValue}>{characters.length}</b>
            </span>
            <span className={styles.previewRow}>
              Sincronização
              <b
                className={[
                  styles.previewValue,
                  syncStatus === 'error' ? styles.previewValueWarn : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {SYNC_LABELS[syncStatus] ?? syncStatus}
              </b>
            </span>
          </div>

          <menu className={styles.menu}>
            <li>
              {/* Fecha no clique, nao num efeito de rota: a unica navegacao
                  de dentro do painel e esta, e clicar em qualquer outra coisa
                  ja cai no handler de clique-fora. */}
              <Link className={styles.item} to={ROUTES.profile} onClick={close}>
                <span>
                  <i className={styles.itemIcon} aria-hidden="true">
                    ◇{' '}
                  </i>
                  Perfil
                </span>
              </Link>
            </li>

            <li>
              <Switch
                className={styles.item}
                isOn={isDark}
                onToggle={() => setTheme(isDark ? 'light' : 'dark')}
              >
                <i className={styles.itemIcon} aria-hidden="true">
                  {isDark ? '◐' : '◑'}
                </i>
                Tema escuro
              </Switch>
            </li>

            <li>
              <button
                type="button"
                className={[styles.item, styles.signOut].join(' ')}
                onClick={() => void signOut()}
              >
                <span>
                  <i className={styles.itemIcon} aria-hidden="true">
                    ✕{' '}
                  </i>
                  Sair da conta
                </span>
              </button>
            </li>
          </menu>
        </section>
      ) : null}
    </div>
  )
}
