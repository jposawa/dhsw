import { useAtom, useAtomValue } from "jotai"
import React from "react"
import { Outlet, useLocation } from "react-router-dom"

import { NAV_ITEMS, ROUTES } from "@/constants"
import { BottomNav } from "@/fragments"
import { useAuth, useConfig, useSheetSync } from "@/hooks"
import { themeAtom, toastAtom, isNavCollapsedAtom } from "@/states"

import styles from "./App.module.css"

/**
 * A marca: um recorte do mapa holográfico da galáxia.
 *
 * O arco escalonado de Coruscant que estava aqui era art déco genérico — lia
 * como skyline, não como Star Wars, e não tinha o que ver com o resto do app.
 * O mapa dá a mesma geometria de régua e traço fino, mas com origem: anéis
 * concêntricos cortados por raios em setores, o núcleo denso de estrelas no
 * meio e a Orla Exterior se abrindo — é o vocabulário que os seis emblemas de
 * domínio também usam (`components/DomainSymbol`).
 *
 * Meio disco, e não o disco inteiro: a faixa tem 62px de altura e o título fica
 * no centro dela. Um círculo completo ou seria minúsculo ou passaria por cima
 * das letras; cortado na linha de base, o mapa emoldura o texto e some atrás
 * dele. `aria-hidden` porque é ornamento — quem lê por áudio já recebe o `h1`.
 */
const Crest = ({ subtitle }: { subtitle: string }) => (
  <div className={styles.crest}>
    <svg
      className={styles.crestArt}
      width="420"
      height="62"
      viewBox="0 0 420 62"
      aria-hidden="true"
    >
      {/*
        Anéis concêntricos a partir de um centro na base da faixa. O de dentro
        (r=50) fecha dentro do quadro e é o que emoldura o título; os de fora
        saem por cima e só mostram os flancos, que é como o disco continua para
        além da moldura em vez de terminar nela.
      */}
      <g fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M160 62a50 50 0 0 1 100 0" opacity=".9" />
        <path d="M134 62a76 76 0 0 1 152 0" opacity=".55" />
        <path d="M100 62a110 110 0 0 1 220 0" opacity=".34" />
        <path d="M60 62a150 150 0 0 1 300 0" opacity=".2" />
        <path d="M14 62a196 196 0 0 1 392 0" opacity=".1" />
      </g>

      {/*
        Os cortes de setor. Começam **fora** do anel interno, nunca no centro:
        raios convergindo passariam por trás do título, e foi por isso que a
        primeira versão embolou. Saindo da borda do anel, eles abrem para fora
        e deixam o miolo limpo.
      */}
      <g fill="none" stroke="currentColor" strokeWidth="1" opacity=".4">
        <path d="M210 10V0" />
        <path d="m236 17 10-17M247 25l25-25M255 36l30-36" />
        <path d="m184 17-10-17M173 25l-25-25M165 36l-30-36" />
      </g>

      {/* Marcadores de setor, sobre o anel interno. */}
      <g fill="currentColor" opacity=".65">
        <rect x="208" y="10" width="4" height="4" />
        <rect x="243" y="25" width="3" height="3" />
        <rect x="174" y="25" width="3" height="3" />
      </g>

      {/* Estrelas: só nos flancos, longe do texto que fica no centro. */}
      <g fill="currentColor">
        <circle cx="120" cy="44" r="1.2" opacity=".6" />
        <circle cx="96" cy="54" r="1" opacity=".45" />
        <circle cx="138" cy="56" r=".9" opacity=".4" />
        <circle cx="300" cy="44" r="1.2" opacity=".6" />
        <circle cx="324" cy="54" r="1" opacity=".45" />
        <circle cx="282" cy="56" r=".9" opacity=".4" />
        <circle cx="66" cy="58" r=".8" opacity=".3" />
        <circle cx="354" cy="58" r=".8" opacity=".3" />
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
 *
 * Casa por prefixo além de por igualdade, senão qualquer rota filha perde o
 * nome — `/compendio/cartas` mostrava "DH · SW" no lugar de "COMPÊNDIO". A
 * raiz fica de fora do teste de prefixo porque `/` é prefixo de tudo e
 * roubaria o nome de todas as telas.
 */
const subtitleFor = (pathname: string): string => {
  const match =
    NAV_ITEMS.find((item) => item.path === pathname) ??
    NAV_ITEMS.find(
      (item) => item.path !== ROUTES.home && pathname.startsWith(`${item.path}/`),
    )

  if (match) {
    return match.label
  }

  if (pathname === ROUTES.profile) {
    return "PERFIL"
  }

  if (pathname.startsWith(ROUTES.party(""))) {
    return "GRUPO"
  }

  return pathname.startsWith(ROUTES.sheet("")) ? "FICHA" : "DH · SW"
}

export const App = () => {
  const theme = useAtomValue(themeAtom)
  const isNavCollapsed = useAtomValue(isNavCollapsedAtom)
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
    <div
      className={`theme-${theme} ${styles.shell}`}
      data-ronin-theme={theme}
      /* A largura efetiva do trilho mora aqui, e não no `nav`: o padding do
         conteúdo e a posição do toast dependem dela, e são irmãos da barra —
         herdar do ancestral comum é o que mantém os três de acordo. */
      style={
        {
          "--side-nav-width": isNavCollapsed
            ? "var(--side-nav-width-collapsed)"
            : "var(--side-nav-width-expanded)",
        } as React.CSSProperties
      }
    >
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
