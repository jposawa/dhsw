import { CHARACTER_SCHEMA_VERSION, DEFAULT_HOUSE_RULES, MIXED_ANCESTRY_OPTION } from "@/constants"
import type { Advancement, Character, Heritage, HouseRules, RosterState } from "@/types"

import { changesFor } from "./advancement"

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
          schema: 4,
        },
      ]
    }),
  )

  return { characters, order: roster?.order ?? [] }
}

/**
 * v4 → v5: a ascendência mista, como campo solto ao lado da espécie. Ficha
 * existente tem espécie única — as duas features vêm dela, como antes.
 *
 * O formato desta versão não é mais o de `Character`: a v6 juntou os dois
 * campos num objeto. Migração lê o que estava gravado, e o que estava gravado
 * aqui era este formato.
 */
type CharacterV5 = Omit<Character, "heritage"> & {
  ancestry?: string | null
  mixedAncestry?: string | null
}

export const rosterV4ToV5 = (value: unknown): RosterState => {
  const roster = value as { characters?: Record<string, CharacterV5>; order?: string[] } | null

  const characters = Object.fromEntries(
    Object.entries(roster?.characters ?? {}).map(([id, character]) => [
      id,
      // `as unknown`: o resultado ainda é o formato da v5, e só a última
      // migração da corrente devolve uma ficha de hoje.
      { ...character, mixedAncestry: character.mixedAncestry ?? null, schema: 5 } as unknown as Character,
    ]),
  )

  return { characters, order: roster?.order ?? [] }
}

/**
 * v5 → v6: `Character.heritage`. Os dois campos soltos — a espécie e a da
 * ascendência mista — viram um objeto com código, nome e a espécie de cada
 * feature. Ficha de espécie única guarda o nome dela como código.
 */
export const rosterV5ToV6 = (value: unknown): RosterState => {
  const roster = value as RosterState | null

  const characters = Object.fromEntries(
    Object.entries(roster?.characters ?? {}).map(([id, stored]) => {
      const { ancestry = null, mixedAncestry = null, ...rest } = stored as unknown as CharacterV5
      const isMixed = mixedAncestry !== null

      return [
        id,
        {
          ...rest,
          heritage: {
            ancestry: isMixed ? MIXED_ANCESTRY_OPTION : ancestry,
            label: null,
            firstAncestry: isMixed ? ancestry : null,
            secondAncestry: mixedAncestry,
          },
          // `as unknown`: ainda é o formato da v6, e só a última migração da
          // corrente devolve uma ficha de hoje.
          schema: 6,
        } as unknown as Character,
      ]
    }),
  )

  return { characters, order: roster?.order ?? [] }
}

/** A ascendência como a v6 a guardava: código no campo do nome. */
type HeritageV6 = {
  ancestry?: string | null
  label?: string | null
  firstAncestry?: string | null
  secondAncestry?: string | null
}

/**
 * v6 → v7: a ascendência ganha **uma forma só**.
 *
 * O campo do nome deixa de acumular dois papéis — nome de espécie e o código
 * `"mixed"` —, e as fontes de feature passam a valer para as duas: na espécie
 * única as duas apontam para ela mesma, e é isso que apaga o ramo "é mista?"
 * de quem lê.
 *
 * A mista guardada traz as fontes como estavam, inclusive a 1ª que a versão
 * anterior copiava da espécie escolhida antes: migração não adivinha escolha
 * de ninguém, e apagá-la aqui tiraria uma feature de fichas em jogo. Quem não
 * a quis troca na ficha, e a mista nova já nasce em branco.
 */
export const rosterV6ToV7 = (value: unknown): RosterState => {
  const roster = value as RosterState | null

  const characters = Object.fromEntries(
    Object.entries(roster?.characters ?? {}).map(([id, stored]) => {
      const { heritage = {}, ...rest } = stored as unknown as Omit<Character, "heritage"> & {
        heritage?: HeritageV6
      }

      const { ancestry = null, label = null, firstAncestry = null, secondAncestry = null } = heritage
      const isMixed = ancestry === MIXED_ANCESTRY_OPTION

      const migrated: Heritage = isMixed
        ? { name: label, sources: { first: firstAncestry, second: secondAncestry }, isMixed: true }
        : { name: ancestry, sources: { first: ancestry, second: ancestry }, isMixed: false }

      // `as unknown`: ainda é o formato da v7, e só a última migração da
      // corrente devolve uma ficha de hoje.
      return [id, { ...rest, heritage: migrated, schema: 7 } as unknown as Character]
    }),
  )

  return { characters, order: roster?.order ?? [] }
}

/**
 * v7 → v8: `Character.avatarUrl`. Ficha antiga entra sem imagem.
 *
 * Campo novo com valor padrão é o caso mais simples de migração, e é por isso
 * que ela existe mesmo assim: sem subir a versão, a ficha ficaria declarando
 * v7 com forma de v8, e a próxima migração leria errado sem nada acusar.
 */
export const rosterV7ToV8 = (value: unknown): RosterState => {
  const roster = value as RosterState | null

  const characters = Object.fromEntries(
    Object.entries(roster?.characters ?? {}).map(([id, stored]) => [
      id,
      // `as unknown`: ainda é o formato da v8, e só a última migração da
      // corrente devolve uma ficha de hoje.
      { ...stored, avatarUrl: stored.avatarUrl ?? null, schema: 8 } as unknown as Character,
    ]),
  )

  return { characters, order: roster?.order ?? [] }
}

/**
 * v8 → v9: o avanço passa a carregar os próprios modificadores.
 *
 * Antes, `derive` tinha um `switch` sobre o tipo do avanço decidindo o que
 * cada um somava. Agora o avanço diz, e a conta só repete — os números da
 * ficha não mudam, a explicação de onde eles vêm é que sai do meio da
 * matemática e vai para o histórico.
 *
 * `changesFor` é a mesma função que a tela usa para criar avanço novo: se a
 * migração e a criação divergissem, ficha velha e ficha nova somariam
 * diferente pelo mesmo avanço.
 */
export const rosterV8ToV9 = (value: unknown): RosterState => {
  const roster = value as RosterState | null

  const characters = Object.fromEntries(
    Object.entries(roster?.characters ?? {}).map(([id, stored]) => [
      id,
      {
        ...stored,
        advancements: (stored.advancements ?? []).map((advancement: AdvancementV11) => ({
          ...advancement,
          changes: advancement.changes ?? changesFor(advancement.kind, [advancement.detail ?? ""]),
        })),
        schema: 9,
        // `as unknown`: ainda é o formato da v9, e só a última migração da
        // corrente devolve uma ficha de hoje.
      } as unknown as Character,
    ]),
  )

  return { characters, order: roster?.order ?? [] }
}

/** v9 → v10: `Character.featureNotes`. Ficha antiga entra sem resposta nenhuma. */
export const rosterV9ToV10 = (value: unknown): RosterState => {
  const roster = value as RosterState | null

  const characters = Object.fromEntries(
    Object.entries(roster?.characters ?? {}).map(([id, stored]) => [
      id,
      // `as unknown`: ainda é o formato da v10, e só a última migração da
      // corrente devolve uma ficha de hoje.
      { ...stored, featureNotes: stored.featureNotes ?? {}, schema: 10 } as unknown as Character,
    ]),
  )

  return { characters, order: roster?.order ?? [] }
}

/**
 * v10 → v11: `Character.traitArray`.
 *
 * Ficha antiga entra com `null` — o array do livro. Os atributos dela não
 * mudam: eles já estavam guardados em `traits`, e a distribuição é lida de
 * volta comparando um com o outro.
 */
export const rosterV10ToV11 = (value: unknown): RosterState => {
  const roster = value as RosterState | null

  const characters = Object.fromEntries(
    Object.entries(roster?.characters ?? {}).map(([id, stored]) => [
      id,
      { ...stored, traitArray: stored.traitArray ?? null, schema: 11 } as unknown as Character,
    ]),
  )

  return { characters, order: roster?.order ?? [] }
}

/** O avanço até a v11: uma escolha só, num campo de texto. */
type AdvancementV11 = Omit<Advancement, "details"> & { detail?: string }

/**
 * v11 → v12: a escolha do avanço vira lista — `detail` → `details`.
 *
 * Os avanços que pedem escolha pedem **dois** de uma vez: dois atributos, duas
 * Experiences (p. 110). Um campo só guardava metade.
 *
 * Os `changes` gravados ficam como estão. Eles são o que a ficha somou de
 * verdade quando o avanço foi comprado, e recalculá-los aqui mudaria número de
 * ficha em mesa para casar com uma regra que ela não jogou.
 */
export const rosterV11ToV12 = (value: unknown): RosterState => {
  const roster = value as { characters?: Record<string, Character>; order?: string[] } | null

  const characters = Object.fromEntries(
    Object.entries(roster?.characters ?? {}).map(([id, stored]) => [
      id,
      {
        ...stored,
        advancements: (stored.advancements ?? []).map((advancement) => {
          const { detail, ...rest } = advancement as AdvancementV11

          return { ...rest, details: detail ? [detail] : [] }
        }),
        schema: CHARACTER_SCHEMA_VERSION,
      },
    ]),
  )

  return { characters, order: roster?.order ?? [] }
}

/** Regras da casa v1 → v2: as três regras novas entram desligadas. */
export const houseRulesV1ToV2 = (value: unknown): HouseRules => ({
  ...DEFAULT_HOUSE_RULES,
  ...((value as Partial<HouseRules> | null) ?? {}),
})
