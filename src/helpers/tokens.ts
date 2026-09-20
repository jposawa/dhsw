import { fail, ok } from "@/helpers"
import type {
  Character,
  Compendium,
  DerivedStats,
  ActiveTokenPool,
  RandomDie,
  RestKind,
  Result,
  TokenSource,
  TokenCount,
  TokenPool,
  TokenRefill,
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

/**
 * Chave de uma fonte na ficha. A classe e a subclasse entram na chave: trocar
 * de classe não herda os tokens de uma feature de mesmo nome.
 */
export const tokenPoolKey = (source: TokenSource, owner: string, name: string): string =>
  `${source}:${owner}:${name}`

const scaleValue = (
  pool: TokenPool,
  character: Character,
  derived: DerivedStats,
  compendium: Compendium,
): number => {
  switch (pool.scale) {
    case "domainCards":
      return [...character.loadout, ...character.vault].filter(
        (name) => compendium.skills.find((skill) => skill.name === name)?.domain === pool.domain,
      ).length
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
export const tokenMax = (
  pool: TokenPool,
  character: Character,
  derived: DerivedStats,
  compendium: Compendium,
): number | null => {
  if (!pool.scale) {
    return null
  }

  const value = scaleValue(pool, character, derived, compendium)
  const scaled = pool.isHalved ? Math.ceil(value / 2) : value

  return Math.max(pool.maxAtLeast ?? 0, scaled)
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
        owner: classDefinition?.name ?? "",
        name: feature.name,
        pool: feature.tokens,
        max: tokenMax(feature.tokens, character, derived, compendium),
        dieSides: feature.tokens.dieSides ?? null,
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
          owner: subclass.name,
          name: feature.name,
          pool: feature.tokens,
          max: tokenMax(feature.tokens, character, derived, compendium),
          dieSides: feature.tokens.dieSides ?? null,
          domain: classDomain,
        })
      }
    }
  }

  for (const skillName of character.loadout) {
    const skill = compendium.skills.find((candidate) => candidate.name === skillName)

    for (const pool of skill?.tokens ?? []) {
      pools.push({
        key: tokenPoolKey("card", skill?.name ?? "", pool.name),
        source: "card",
        owner: skill?.name ?? "",
        name: pool.name,
        pool,
        max: tokenMax(pool, character, derived, compendium),
        dieSides: pool.dieSides ?? null,
        domain: skill?.domain ?? null,
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
    // Fonte de dado nasce **vazia**: o dado só existe depois de rolado. Fonte
    // de marca nasce cheia — é o "place N tokens" do descanso.
    return active.dieSides === null ? active.max ?? 0 : 0
  }

  if (active.dieSides !== null) {
    return tokenDice(character, active).length
  }

  return active.max === null ? stored.count : Math.min(stored.count, active.max)
}

/**
 * Os dados ainda não gastos desta fonte, do jeito que caíram.
 *
 * Vazio na fonte de marcas, e na de dados que ainda não foi rolada — que é
 * como ela passa o tempo entre o gasto do último dado e o próximo descanso.
 */
export const tokenDice = (character: Character, active: ActiveTokenPool): readonly number[] => {
  if (active.dieSides === null) {
    return []
  }

  return character.tokens.find((entry) => entry.pool === active.key)?.values ?? []
}

/** Grava a mão de dados de uma fonte. `count` acompanha, para quem só conta. */
const withDice = (character: Character, key: string, values: readonly number[]): Character => ({
  ...character,
  tokens: [
    ...character.tokens.filter((entry) => entry.pool !== key),
    { pool: key, count: values.length, values },
  ],
})

/** A fonte de dados desta chave, ou falha — o mesmo cuidado de `setTokenCount`. */
const dicePoolOf = (
  character: Character,
  key: string,
  derived: DerivedStats,
  compendium: Compendium,
): ActiveTokenPool | null =>
  activeTokenPools(character, derived, compendium).find(
    (candidate) => candidate.key === key && candidate.dieSides !== null,
  ) ?? null

/**
 * Rola a mão inteira: tantos dados quanto o teto manda, **jogando fora o que
 * não foi gasto** — "Clear any unspent dice before rolling" (Determination
 * Dice). Rolar de novo não acumula.
 *
 * O sorteio entra por parâmetro, como no rolador: é o que deixa o teste
 * verificar a quantidade sem depender de sorte.
 */
export const rollTokenDice = (
  character: Character,
  key: string,
  derived: DerivedStats,
  compendium: Compendium,
  random: RandomDie,
): Result<Character> => {
  const active = dicePoolOf(character, key, derived, compendium)

  if (!active || active.dieSides === null) {
    return fail("tokenPoolUnknown", key)
  }

  const count = active.max ?? 0
  const values = Array.from({ length: count }, () => random(active.dieSides as number))

  return ok(withDice(character, key, values))
}

/**
 * Gasta **um** dado, pela posição.
 *
 * Pela posição e não pelo valor: dois dados podem ter caído no mesmo número, e
 * gastar "o 3" apagaria um 3 qualquer — o da esquerda, sempre, que não é o que
 * o dedo apontou.
 */
export const spendTokenDie = (
  character: Character,
  key: string,
  index: number,
  derived: DerivedStats,
  compendium: Compendium,
): Result<Character> => {
  const active = dicePoolOf(character, key, derived, compendium)

  if (!active) {
    return fail("tokenPoolUnknown", key)
  }

  const values = tokenDice(character, active)

  if (index < 0 || index >= values.length) {
    return fail("tokenDieUnknown", key)
  }

  return ok(withDice(character, key, values.filter((_unused, position) => position !== index)))
}

/**
 * Põe um dado com o valor que a mesa rolou na mão.
 *
 * Existe porque muita mesa rola dado de verdade: o app precisa receber o
 * número que caiu na mesa, e não obrigar a usar o sorteio dele. O teto é o
 * mesmo da rolagem automática — a feature diz quantos dados cabem.
 */
export const addTokenDie = (
  character: Character,
  key: string,
  value: number,
  derived: DerivedStats,
  compendium: Compendium,
): Result<Character> => {
  const active = dicePoolOf(character, key, derived, compendium)

  if (!active || active.dieSides === null) {
    return fail("tokenPoolUnknown", key)
  }

  if (!Number.isInteger(value) || value < 1 || value > active.dieSides) {
    return fail("tokenDieOutOfRange", `d${active.dieSides}`)
  }

  const values = tokenDice(character, active)

  if (active.max !== null && values.length >= active.max) {
    return fail("tokenDiceFull", String(active.max))
  }

  return ok(withDice(character, key, [...values, value]))
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

/** O que repõe tokens: os dois descansos, e só eles. */
export type TokenRefillMoment = RestKind

const REFILLED_BY: Readonly<Record<TokenRefillMoment, readonly TokenRefill[]>> = {
  short: ["rest"],
  long: ["rest", "longRest"],
}

/** O `TokenPool` de uma chave, procurado no compêndio. */
const poolOfKey = (key: string, compendium: Compendium): TokenPool | undefined => {
  const [source, owner, ...rest] = key.split(":")
  const name = rest.join(":")

  if (source === "card") {
    return compendium.skills
      .find((skill) => skill.name === owner)
      ?.tokens?.find((pool) => pool.name === name)
  }

  if (source === "class") {
    return compendium.classes
      .find((candidate) => candidate.name === owner)
      ?.features.find((candidate) => candidate.name === name)?.tokens
  }

  const subclass = compendium.subclasses.find((candidate) => candidate.name === owner)

  return [
    ...(subclass?.foundation ?? []),
    ...(subclass?.specialization ?? []),
    ...(subclass?.mastery ?? []),
  ].find((candidate) => candidate.name === name)?.tokens
}

/**
 * Descansar repõe: apaga a contagem das fontes que voltam agora, o que
 * as devolve ao inicial — cheias, ou zeradas se forem acumulador. Fonte que o
 * compêndio já não conhece também sai: não há o que contar.
 *
 * **Fonte de dado não volta: ela se rola de novo.** O descanso joga fora o que
 * não foi gasto e rola a mão inteira ali mesmo — é o que o Determination Dice
 * manda ("Clear any unspent dice before rolling"), e é o que evita a ficha
 * passar o descanso com um botão de rolar esperando um toque que ninguém dá.
 * Quem rola na mesa com dado de verdade corrige os valores na ficha depois.
 */
export const refillTokens = (
  character: Character,
  moment: TokenRefillMoment,
  derived: DerivedStats,
  compendium: Compendium,
  random: RandomDie,
): Character => {
  const kept = character.tokens.filter((entry) => {
    const pool = poolOfKey(entry.pool, compendium)

    return pool !== undefined && !REFILLED_BY[moment].includes(pool.refill)
  })

  const emptied: Character = { ...character, tokens: kept }

  return activeTokenPools(emptied, derived, compendium)
    .filter(
      (active) => active.dieSides !== null && REFILLED_BY[moment].includes(active.pool.refill),
    )
    .reduce((current, active) => {
      const rolled = rollTokenDice(current, active.key, derived, compendium, random)

      return rolled.ok ? rolled.value : current
    }, emptied)
}
