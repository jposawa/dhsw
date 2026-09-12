import type { Character } from "./character"

/** Escuro e o padrao: app de mesa, sala mal iluminada. */
export type Theme = "dark" | "light"

export type SheetTabId = "combate" | "cartas" | "inventario" | "historia"

export type CompendiumTabId =
  | "cartas"
  | "classes"
  | "especies"
  | "origens"
  | "dominios"
  | "equipamento"

/** Os quatro formatos de equipamento. Filtro dentro do segmento, não rota. */
export type GearKind = "armas" | "armaduras" | "itens" | "consumiveis"

/** Como as cartas do compêndio são apresentadas. */
export type CompendiumViewMode = "list" | "grid"

export type RosterState = {
  characters: Record<string, Character>
  order: readonly string[]
}
