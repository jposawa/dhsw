import { CHARACTER_SCHEMA_VERSION, DEFAULT_HOUSE_RULES } from "@/constants"
import type { Character, HouseRules, RosterState } from "@/types"

/**
 * Migrações do formato salvo. Puras, e **acumulativas: nenhuma é apagada**.
 *
 * Cada cliente encontra o dado no formato em que ele foi escrito, possivelmente
 * por uma versão do app de meses atrás. Rodam na leitura, nunca na escrita.
 * Ver BACKEND.md.
 *
 * Duas versões andam juntas e não são a mesma coisa:
 *
 * - `STORAGE_VERSIONS.roster` versiona **o pacote** no `localStorage`, e é o
 *   que escolhe qual migração roda;
 * - `Character.schema` versiona **cada ficha**, e é o que viaja para o Realtime
 *   Database e para o código de compartilhamento.
 *
 * Migração que muda a forma da ficha tem que subir as duas. Subir só a do
 * pacote deixaria fichas com a forma nova declarando a versão velha — e a
 * próxima migração leria errado, sem nada acusar.
 */

/** v1 → v2: `Character.partyId`. Ficha existente não pertence a party nenhuma. */
export const rosterV1ToV2 = (value: unknown): RosterState => {
  const roster = value as RosterState | null

  const characters = Object.fromEntries(
    Object.entries(roster?.characters ?? {}).map(([id, stored]) => {
      const character = stored as Character

      return [
        id,
        {
          ...character,
          partyId: character.partyId ?? null,
          schema: 2,
        },
      ]
    }),
  )

  return { characters, order: roster?.order ?? [] }
}

/** v2 → v3: `Character.tokens`. Ficha existente começa com todos os contadores no inicial. */
export const rosterV2ToV3 = (value: unknown): RosterState => {
  const roster = value as RosterState | null

  const characters = Object.fromEntries(
    Object.entries(roster?.characters ?? {}).map(([id, stored]) => {
      const character = stored as Character

      return [
        id,
        { ...character, tokens: character.tokens ?? [], schema: 3 },
      ]
    }),
  )

  return { characters, order: roster?.order ?? [] }
}

/**
 * v3 → v4: `Character.houseRules`. Ficha existente recebe as regras que valiam
 * para ela até aqui — as do aparelho —, para nenhum número mudar sozinho.
 */
export const rosterV3ToV4 = (value: unknown, current: HouseRules): RosterState => {
  const roster = value as RosterState | null

  const characters = Object.fromEntries(
    Object.entries(roster?.characters ?? {}).map(([id, stored]) => {
      const character = stored as Character

      return [
        id,
        {
          ...character,
          houseRules: character.houseRules ?? current,
          schema: CHARACTER_SCHEMA_VERSION,
        },
      ]
    }),
  )

  return { characters, order: roster?.order ?? [] }
}

/** Regras da casa v1 → v2: as três regras novas entram desligadas. */
export const houseRulesV1ToV2 = (value: unknown): HouseRules => ({
  ...DEFAULT_HOUSE_RULES,
  ...((value as Partial<HouseRules> | null) ?? {}),
})
