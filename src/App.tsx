import { useAtom, useAtomValue } from 'jotai'
import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { NAV_ITEMS, ROUTES } from '@/constants'
import { BottomNav } from '@/fragments'
import { useAuth, useConfig, useSheetSync } from '@/hooks'
import { themeAtom, toastAtom } from '@/states'

import styles from './App.module.css'

const Crest = ({ subtitle }: { subtitle: string }) => (
  <div className={styles.crest}>
    <svg className={styles.crestArt} width="340" height="62" viewBox="0 0 340 62" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M170 4 L170 62 M120 62 L120 26 L136 26 L136 16 L152 16 L152 8 L188 8 L188 16 L204 16 L204 26 L220 26 L220 62" />
        <path d="M96 62 L96 38 L112 38 L112 30 M244 62 L244 38 L228 38 L228 30" />
        <path d="M72 62 L72 48 L88 48 M268 62 L268 48 L252 48" />
        <path d="M48 62 L48 54 M292 62 L292 54" />
      </g>
      <g fill="currentColor" opacity=".55">
        <circle cx="170" cy="4" r="2.5" />
        <rect x="118" y="24" width="4" height="4" />
        <rect x="218" y="24" width="4" height="4" />
      </g>
    </svg>
    <div className={styles.crestWord}>
      <h1 className={styles.crestTitle}>DH · SW</h1>
      <p className={styles.crestSubtitle}>{subtitle}</p>
    </div>
  </div>
)

/**
 * Subtítulo do brasão: vem do mesmo catálogo do menu, para não haver duas
 * listas de nomes de página divergindo com o tempo.
 */
const subtitleFor = (pathname: string): string => {
  const match = NAV_ITEMS.find((item) => item.path === pathname)

  if (match) {
    return match.label
  }

  if (pathname === ROUTES.profile) {
    return 'PERFIL'
  }

  return pathname.startsWith(ROUTES.sheet('')) ? 'FICHA' : 'DH · SW'
}

export const App = () => {
  const theme = useAtomValue(themeAtom)
  const [toast, setToast] = useAtom(toastAtom)
  const location = useLocation()

  // As assinaturas do app vivem aqui, uma vez só: duas instâncias do listener
  // do Firebase seriam trabalho repetido, não redundância útil.
  useAuth()
  // O unico lugar do app que busca a config. Todo o resto so le.
  useConfig({ initialFetch: true })
  useSheetSync()

  React.useEffect(() => {
    if (!toast) {
      return
    }

    const timer = window.setTimeout(() => setToast(null), 1800)

    return () => window.clearTimeout(timer)
  }, [toast, setToast])

  return (
    <div className={`theme-${theme} ${styles.shell}`}>
      <header className={styles.top}>
        <Crest subtitle={subtitleFor(location.pathname)} />
      </header>

      <Outlet />

      <BottomNav />

      {toast ? (
        <div className={styles.toast} role="status">
          {toast}
        </div>
      ) : null}
    </div>
  )
}
