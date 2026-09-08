import type { NavItem } from '@/types'

import { ROUTES } from './routes'

/**
 * Catalogo de destinos.
 *
 * **Invariante: toda chave aqui tem rota registrada em `main.tsx`.** E ela
 * que torna seguro deixar a config remota ligar itens e escolher a pagina
 * inicial — chave conhecida garante rota existente. Um destino sem rota nao
 * entra no catalogo, mesmo desligado: bastaria alguem por `active: true` na
 * config para o menu apontar para o nada.
 *
 * Por isso `dados` (compartilhamento) ainda nao esta aqui. Entra junto com a
 * pagina, na mesma mudanca.
 *
 * `active` e `order` sao o padrao do codigo; a config remota manda por cima,
 * por chave. `needAuth` espelha a fronteira de rotas — este campo esconde o
 * item, o `AuthGate` e quem protege.
 */
export const NAV_ITEMS: readonly NavItem[] = [
  {
    key: 'compendium',
    label: 'COMPÊNDIO',
    icon: '◈',
    path: ROUTES.compendium,
    needAuth: false,
    active: true,
    order: 0,
  },
  {
    key: 'roster',
    label: 'FICHAS',
    icon: '◐',
    path: ROUTES.roster,
    needAuth: true,
    active: true,
    order: 1,
  },
  {
    key: 'parties',
    label: 'GRUPOS',
    icon: '◎',
    path: ROUTES.parties,
    needAuth: true,
    active: true,
    order: 2,
  },
  {
    key: 'houseRules',
    label: 'REGRAS',
    icon: '⚙',
    path: ROUTES.houseRules,
    needAuth: false,
    active: true,
    order: 3,
  },
]

/**
 * Fallback da pagina inicial, no codigo.
 *
 * A config remota manda por cima; isto e o que vale quando ela nao respondeu,
 * nao trouxe o campo, ou trouxe chave que nao serve.
 */
export const DEFAULT_HOME = {
  authenticated: 'roster',
  anonymous: 'compendium',
} as const
