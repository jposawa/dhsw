import { fail, ok } from "@/helpers"
import type {
  Character,
  Compendium,
  DerivedStats,
  Domain,
  RestKind,
  Result,
  TokenCount,
  TokenPool,
} from "@/types"

import { subclassUpgradesOf } from "./identity"

/**
 * Tokens de feature e de carta, por ficha.
 *
 * A conversão troca "uma vez por descanso/sessão" por um punhado de tokens:
 * quantos, sai da escala da fonte (Tier, Proficiency, atributo); quando voltam,
 * do `refill`. A ficha guarda só quantos restam — o teto é derivado, como o
 * máximo de HP.
 */

export type TokenSource = "class" | "subclass" | "card"

/**
 * Chave de uma fonte na ficha. A classe e a subclasse entram na chave: trocar
 * de classe não herda os tokens de uma feature de mesmo nome.
 */
export const tokenPoolKey = (source: TokenSource, owner: string, feature: string): string =>
  source === "card" ? `card:${owner}` : `${source}:${owner}:${feature}`

/** Uma fonte de tokens que a ficha tem agora. */
export type ActiveTokenPool = {
  key: string
  source: TokenSource
  /** Nome da feature ou da carta. */
  name: string
  pool: TokenPool
  /** Teto dos tokens. `null` é acumulador, sem teto. */
  max: number | null
  /** Cor do domínio, para o contador acompanhar a carta ou a classe. */
  domain: Domain | null
}

const scaleValue = (pool: TokenPool, derived: DerivedStats): number => {
  switch (pool.scale) {
    case "tier":
      return derived.tier
    case "proficiency":
      return derived.proficiency.total
    case "forcewield":
      return derived.spellcastTrait ? derived.traits[derived.spellcastTrait].total : 0
    case undefined:
      return 0
    default:
      return derived.traits[pool.scale].total
  }
}

/** Quantos tokens a reposição põe. `null` para acumulador. */
export const tokenMax = (pool: TokenPool, derived: DerivedStats): number | null => {
  if (!pool.scale) {
    return null
  }

  const value = scaleValue(pool, derived)
  const scaled = pool.isHalved ? Math.ceil(value / 2) : value

  return Math.max(pool.minimum ?? 0, scaled)
}

/**
 * As fontes de token da ficha: features da classe, features da subclasse já
 * ganhas, e cartas do **loadout** — carta no vault não está em jogo.
 */
export const activeTokenPools = (
  character: Character,
  derived: DerivedStats,
  compendium: Compendium,
): ActiveTokenPool[] => {
  const pools: ActiveTokenPool[] = []
  const classDefinition = compendium.classes.find(
    (candidate) => candidate.name === character.className,
  )
  const classDomain = classDefinition?.domains[0] ?? null

  for (const feature of classDefinition?.features ?? []) {
    if (feature.tokens) {
      pools.push({
        key: tokenPoolKey("class", classDefinition?.name ?? "", feature.name),
        source: "class",
        name: feature.name,
        pool: feature.tokens,
        max: tokenMax(feature.tokens, derived),
        domain: classDomain,
      })
    }
  }

  const subclass = compendium.subclasses.find(
    (candidate) =>
      candidate.name === character.subclass && candidate.className === character.className,
  )

  if (subclass) {
    const upgrades = subclassUpgradesOf(character)
    const earned = [
      ...subclass.foundation,
      ...(upgrades >= 1 ? subclass.specialization : []),
      ...(upgrades >= 2 ? subclass.mastery : []),
    ]

    for (const feature of earned) {
      if (feature.tokens) {
        pools.push({
          key: tokenPoolKey("subclass", subclass.name, feature.name),
          source: "subclass",
          name: feature.name,
          pool: feature.tokens,
          max: tokenMax(feature.tokens, derived),
          domain: classDomain,
        })
      }
    }
  }

  for (const skillName of character.loadout) {
    const skill = compendium.skills.find((candidate) => candidate.name === skillName)

    if (skill?.tokens) {
      pools.push({
        key: tokenPoolKey("card", skill.name, skill.name),
        source: "card",
        name: skill.name,
        pool: skill.tokens,
        max: tokenMax(skill.tokens, derived),
        domain: skill.domain,
      })
    }
  }

  return pools
}

/**
 * Quantos tokens restam. Sem entrada, a fonte está no inicial: cheia, ou zerada
 * se for acumulador. Nunca passa do teto — a escala pode ter caído desde que a
 * contagem foi gravada, como o Armor Score que cai ao tirar a armadura.
 */
export const tokenCount = (character: Character, active: ActiveTokenPool): number => {
  const stored = character.tokens.find((entry) => entry.pool === active.key)

  if (!stored) {
    return active.max ?? 0
  }

  return active.max === null ? stored.count : Math.min(stored.count, active.max)
}

/** Grava quantos tokens restam numa fonte que a ficha tem. É jogada: grava no toque. */
export const setTokenCount = (
  character: Character,
  key: string,
  count: number,
  derived: DerivedStats,
  compendium: Compendium,
): Result<Character> => {
  const active = activeTokenPools(character, derived, compendium).find(
    (candidate) => candidate.key === key,
  )

  if (!active) {
    return fail("tokenPoolUnknown", key)
  }

  const clamped = Math.max(0, active.max === null ? count : Math.min(count, active.max))
  const others = character.tokens.filter((entry) => entry.pool !== key)
  const next: TokenCount = { pool: key, count: clamped }

  return ok({ ...character, tokens: [...others, next] })
}

const REFILLED_BY: Readonly<Record<RestKind, readonly TokenPool["refill"][]>> = {
  short: ["rest"],
  long: ["rest", "longRest"],
}

/** O `TokenPool` de uma chave, procurado no compêndio. */
const poolOfKey = (key: string, compendium: Compendium): TokenPool | undefined => {
  if (key.startsWith("card:")) {
    return compendium.skills.find((skill) => skill.name === key.slice("card:".length))?.tokens
  }

  const [source, owner, ...rest] = key.split(":")
  const feature = rest.join(":")

  if (source === "class") {
    return compendium.classes
      .find((candidate) => candidate.name === owner)
      ?.features.find((candidate) => candidate.name === feature)?.tokens
  }

  const subclass = compendium.subclasses.find((candidate) => candidate.name === owner)

  return [
    ...(subclass?.foundation ?? []),
    ...(subclass?.specialization ?? []),
    ...(subclass?.mastery ?? []),
  ].find((candidate) => candidate.name === feature)?.tokens
}

/**
 * Descanso repõe: apaga a contagem das fontes que voltam neste descanso, o que
 * as devolve ao inicial — cheias, ou zeradas se forem acumulador. Fonte que o
 * compêndio já não conhece também sai: não há o que contar.
 */
export const refillTokens = (
  character: Character,
  rest: RestKind,
  compendium: Compendium,
): Character => ({
  ...character,
  tokens: character.tokens.filter((entry) => {
    const pool = poolOfKey(entry.pool, compendium)

    return pool !== undefined && !REFILLED_BY[rest].includes(pool.refill)
  }),
})
