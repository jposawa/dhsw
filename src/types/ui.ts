import type { Character } from './character'

/** Escuro e o padrao: app de mesa, sala mal iluminada. */
export type Theme = 'dark' | 'light'

export type SheetTabId = 'combate' | 'cartas' | 'inventario' | 'historia'

export type CompendiumTabId =
  | 'cartas'
  | 'classes'
  | 'especies'
  | 'origens'
  | 'dominios'
  | 'equipamento'

export type RosterState = {
  characters: Record<string, Character>
  order: readonly string[]
}
