import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { ROUTES } from '@/constants'
import { AuthGate, HomeRoute } from '@/fragments'
import { Compendium } from '@/pages/Compendium'
import { HouseRules } from '@/pages/HouseRules'
import { Profile } from '@/pages/Profile'
import { Roster } from '@/pages/Roster'
import { Sheet } from '@/pages/Sheet'

import { App } from './App'
import './styles/tokens.css'

/**
 * BrowserRouter, não hash.
 *
 * `dh-sw-arquitetura.md` §1 pedia hash router por causa de GitHub Pages, que
 * não reescreve caminho. Não é o alvo: os projetos irmãos publicam em Netlify,
 * onde o fallback de SPA é uma linha — está em `netlify.toml`. Sem esse
 * fallback, recarregar em `/fichas` dá 404, e é a única coisa que o hash
 * router resolvia.
 *
 * O que o hash router **não** resolvia, e por isso a troca não custa nada: o
 * código de compartilhamento continua no fragmento (`/import#payload`), que é
 * o que mantém a ficha fora do log de acesso do servidor. §6.
 *
 * Sem barril em `pages/` de propósito: esta config é o registro único das
 * páginas, e um barril só duplicaria a lista. STRUCTURE.md.
 *
 * A divisão de rotas É a fronteira de acesso do app:
 *
 *   público    /compendio, /regras  — o compêndio não toca o Firebase, e as
 *                                     regras da casa são preferência local
 *   com conta  /fichas, /ficha/:id  — a ficha vive na conta
 *   decide     /                    — com sessão vai para fichas, sem sessão
 *                                     vai para o compêndio
 */
const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: ROUTES.home, element: <HomeRoute /> },
      { path: ROUTES.compendium, element: <Compendium /> },
      { path: ROUTES.houseRules, element: <HouseRules /> },
      {
        element: <AuthGate />,
        children: [
          { path: ROUTES.roster, element: <Roster /> },
          { path: ROUTES.sheet(), element: <Sheet /> },
          { path: ROUTES.profile, element: <Profile /> },
        ],
      },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
