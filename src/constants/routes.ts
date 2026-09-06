import type { CompendiumTabId, SheetTabId } from '@/types'

/**
 * Rotas — dh-sw-arquitetura.md §7, com duas divergencias registradas.
 *
 * 1. **BrowserRouter, nao hash.** Ver BACKEND.md e main.tsx.
 * 2. **`/` nao e o roster.** `/` decide para onde ir conforme a sessao:
 *    com conta vai para `/fichas`, sem conta vai para o compendio. O roster
 *    tem caminho proprio, senao ele nao seria linkavel.
 */
export const ROUTES = {
  home: '/',
  roster: '/fichas',
  sheet: (sheetId = ':sheetId') => `/ficha/${sheetId}`,
  levelUp: (sheetId = ':sheetId') => `/ficha/${sheetId}/levelup`,
  inventoryEntry: (sheetId = ':sheetId', entryId = ':entryId') =>
    `/ficha/${sheetId}/inventario/${entryId}`,
  compendium: '/compendio',
  compendiumEntry: (kind = ':kind', slug = ':slug') => `/compendio/${kind}/${slug}`,
  houseRules: '/regras',
  /** Alcancado pelo menu da conta, nao pela barra — fora do catalogo de `appNav`. */
  profile: '/perfil',
  data: '/dados',
  /**
   * Importacao sempre cria ficha nova — nunca sobrescreve.
   *
   * O payload vai no **fragmento**, nao no caminho: fragmento nao chega ao
   * servidor nem ao log de acesso. dh-sw-arquitetura.md §6. Trocar o hash
   * router por BrowserRouter nao muda isso — sao coisas independentes.
   */
  import: '/import',
} as const

/** Abas de dentro da ficha. Combate abre primeiro: 80% do tempo de sessão. */
export const SHEET_TABS: readonly { id: SheetTabId; label: string }[] = [
  { id: 'combate', label: 'Combate' },
  { id: 'cartas', label: 'Cartas' },
  { id: 'inventario', label: 'Inventário' },
  { id: 'historia', label: 'História' },
]

export const COMPENDIUM_TABS: readonly { id: CompendiumTabId; label: string }[] = [
  { id: 'cartas', label: 'Cartas' },
  { id: 'classes', label: 'Classes' },
  { id: 'especies', label: 'Espécies' },
  { id: 'origens', label: 'Origens' },
  { id: 'dominios', label: 'Domínios' },
  { id: 'equipamento', label: 'Equipamento' },
]
