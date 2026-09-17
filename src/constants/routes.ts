import type { CompendiumTabId, GearKind, SheetTabId } from "@/types"

/**
 * Rotas — dh-sw-arquitetura.md §7, com duas divergencias registradas.
 *
 * 1. **BrowserRouter, nao hash.** Ver BACKEND.md e main.tsx.
 * 2. **`/` nao e o roster.** `/` decide para onde ir conforme a sessao:
 *    com conta vai para `/fichas`, sem conta vai para o compendio. O roster
 *    tem caminho proprio, senao ele nao seria linkavel.
 */
export const ROUTES = {
  home: "/",
  roster: "/fichas",
  sheet: (sheetId = ":sheetId") => `/ficha/${sheetId}`,
  levelUp: (sheetId = ":sheetId") => `/ficha/${sheetId}/levelup`,
  inventoryEntry: (sheetId = ":sheetId", entryId = ":entryId") =>
    `/ficha/${sheetId}/inventario/${entryId}`,
  compendium: "/compendio",
  /** Um segmento do compêndio. As chaves são as de `COMPENDIUM_TABS`. */
  compendiumTab: (tab: CompendiumTabId | ":tab" = ":tab") => `/compendio/${tab}`,
  compendiumEntry: (kind = ":kind", slug = ":slug") => `/compendio/${kind}/${slug}`,
  houseRules: "/regras",
  /** Alcancado pelo menu da conta, nao pela barra — fora do catalogo de `appNav`. */
  profile: "/perfil",
  parties: "/grupos",
  party: (partyId = ":partyId") => `/grupo/${partyId}`,
  data: "/dados",
  /**
   * Importacao sempre cria ficha nova — nunca sobrescreve.
   *
   * O payload vai no **fragmento**, nao no caminho: fragmento nao chega ao
   * servidor nem ao log de acesso. dh-sw-arquitetura.md §6. Trocar o hash
   * router por BrowserRouter nao muda isso — sao coisas independentes.
   */
  import: "/import",
} as const

/** Abas de dentro da ficha. Combate abre primeiro: 80% do tempo de sessão. */
export const SHEET_TABS: readonly { id: SheetTabId; label: string }[] = [
  { id: "combate", label: "Combate" },
  { id: "cartas", label: "Cartas" },
  { id: "inventario", label: "Inventário" },
  { id: "historia", label: "História" },
]

/**
 * Os seis segmentos do compêndio, na ordem da régua.
 *
 * Cartas primeiro porque é o que se consulta em mesa; o resto é referência que
 * se abre entre sessões. Equipamento agrupa armas, armaduras, itens e
 * consumíveis — quatro formatos de dado diferentes que não valem quatro
 * segmentos cada, e que a tela separa por chips.
 */
export const COMPENDIUM_TABS: readonly { id: CompendiumTabId; label: string }[] = [
  { id: "cartas", label: "Cartas" },
  { id: "classes", label: "Classes" },
  { id: "especies", label: "Espécies" },
  { id: "origens", label: "Origens" },
  { id: "dominios", label: "Domínios" },
  { id: "equipamento", label: "Equipamento" },
]

/** Os quatro chips de equipamento, na ordem em que a tela os mostra. */
export const GEAR_KINDS: readonly { id: GearKind; label: string }[] = [
  { id: "armas", label: "Armas" },
  { id: "armaduras", label: "Armaduras" },
  { id: "itens", label: "Itens" },
  { id: "consumiveis", label: "Consumíveis" },
]
