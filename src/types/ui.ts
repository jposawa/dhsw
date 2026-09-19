import type { Character } from "./character"

/** Escuro e o padrao: app de mesa, sala mal iluminada. */
/**
 * Os ícones desenhados em `components/Icon`. União literal porque o valor não
 * é texto livre: cada nome precisa ter arte, e o compilador é quem garante que
 * ninguém aponte para ícone inexistente.
 *
 * Eram glifos Unicode (`◈ ◐ ◎ ⚙`, `🗑`), trocados por duas razões: os
 * geométricos ficavam indistinguíveis no trilho recolhido, e o emoji **ignora
 * `color`** — uma lixeira que não consegue ficar vermelha não avisa de nada.
 */
export type IconName =
  | "account"
  | "compendium"
  | "copy"
  | "dice"
  | "houseRules"
  | "parties"
  | "roster"
  | "trash"

export type Theme = "dark" | "light"

export type SheetTabId = "combate" | "cartas" | "inventario" | "historia" | "regras"

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

/** O que a ficha diz sobre a própria gravação. Ver `fragments/SaveState`. */
export type SaveStateKind = "saved" | "saving" | "failed" | "local"

/** Como as cartas do compêndio são apresentadas. */
export type CompendiumViewMode = "list" | "grid"

export type RosterState = {
  characters: Record<string, Character>
  order: readonly string[]
}
