import { CHARACTER_SCHEMA_VERSION } from "@/constants"
import type { Character, RosterState } from "@/types"

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
          schema: CHARACTER_SCHEMA_VERSION,
        },
      ]
    }),
  )

  return { characters, order: roster?.order ?? [] }
}
