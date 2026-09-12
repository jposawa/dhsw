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

/**
 * Os dois modos da ficha.
 *
 * `play` é a mesa: marcadores à mão, gravados no toque porque marcar Stress no
 * meio de um turno não pode pedir confirmação. `edit` é a oficina: mexe no que
 * **define** os máximos — nome, nível, classe, traços — e nada ali é gravado
 * sem Salvar.
 */
export type SheetMode = "play" | "edit"

/** Como as cartas do compêndio são apresentadas. */
export type CompendiumViewMode = "list" | "grid"

export type RosterState = {
  characters: Record<string, Character>
  order: readonly string[]
}
