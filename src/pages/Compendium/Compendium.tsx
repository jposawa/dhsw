import { NavLink, Outlet } from "react-router-dom"

import { StepRule } from "@/components"
import { COMPENDIUM_TABS, ROUTES } from "@/constants"

import styles from "./Compendium.module.css"

/**
 * O compêndio, e a régua que escolhe o que dele se está vendo.
 *
 * **Cada segmento é uma rota, não um estado.** Ficha e compêndio divergem aqui
 * de propósito: a aba da ficha é onde *você* estava numa ficha que já é o
 * assunto da URL, e some quando se sai dela; o segmento do compêndio é o
 * assunto em si. Sendo rota, ele volta com o botão de voltar, entra no
 * histórico e pode ser mandado para a mesa — "olha a lista de armas" vira um
 * link.
 *
 * O catálogo é `COMPENDIUM_TABS`, que já existia sem uso: as chaves dele são
 * os caminhos, e é o que impede a régua e as rotas de divergirem.
 *
 * Este componente não busca nem filtra nada. Cada segmento tem dado de forma
 * diferente — carta tem domínio e Recall, arma tem alcance e dado de dano — e
 * uma busca genérica o bastante para os seis não serviria bem a nenhum. O que
 * é comum é a moldura, e é só ela que mora aqui.
 */
export const Compendium = () => (
  <main className={styles.page}>
    <StepRule />

    <nav className={styles.segments} aria-label="Seções do compêndio">
      {COMPENDIUM_TABS.map((tab) => (
        <NavLink
          key={tab.id}
          to={ROUTES.compendiumTab(tab.id)}
          className={styles.segment}
          data-testid={`compendium-tab-${tab.id}`}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>

    <Outlet />
  </main>
)
