import { describe, expect, it } from "vitest"

import { TEST_COMPENDIUM } from "@/compendium/testing"
import { DEFAULT_HOUSE_RULES } from "@/constants"
import { createCharacter } from "@/helpers"
import type { Character, DowntimeChoice, Result } from "@/types"

import { derive } from "./sheet"
import { takeRest } from "./downtime"
import {
  activeTokenPools,
  addTokenDie,
  rollTokenDice,
  setTokenCount,
  spendTokenDie,
  tokenCount,
  tokenDice,
  tokenPoolKey,
} from "./tokens"

const unwrap = (result: Result<Character>): Character => {
  if (!result.ok) {
    throw new Error(`esperado ok, veio ${result.code}`)
  }

  return result.value
}

const soldier = (level: number, loadout: string[] = []): Character => ({
  ...createCharacter("Kael"),
  className: "Soldier",
  level,
  loadout,
})

const derivedOf = (character: Character) =>
  derive(character, DEFAULT_HOUSE_RULES, TEST_COMPENDIUM)

const IMPLACABLE = tokenPoolKey("class", "Soldier", "Implacable")
const DETERMINATION = tokenPoolKey("class", "Adept", "Determination Dice")
const NOT_FORGETTING = tokenPoolKey("card", "Not Forgetting", "Not Forgetting")
const REFRESHING_WIND = tokenPoolKey("card", "Refreshing Wind", "Refreshing Wind")

const poolOf = (character: Character, key: string) => {
  const active = activeTokenPools(character, derivedOf(character), TEST_COMPENDIUM).find(
    (candidate) => candidate.key === key,
  )

  if (!active) {
    throw new Error(`sem contador ${key}`)
  }

  return active
}

const set = (character: Character, key: string, count: number) =>
  unwrap(setTokenCount(character, key, count, derivedOf(character), TEST_COMPENDIUM))

const choice = (moveId: string): DowntimeChoice => ({
  moveId,
  rolled: null,
  isOnAlly: false,
  isWithParty: false,
})

const rest = (character: Character, kind: "short" | "long") =>
  unwrap(
    takeRest(
      character,
      derivedOf(character),
      kind,
      kind === "short"
        ? [choice("prepareShort"), choice("prepareShort")]
        : [choice("prepareLong"), choice("prepareLong")],
      TEST_COMPENDIUM,
      () => 1,
    ),
  )

describe("tokenMax", () => {
  /* Implacable: metade do Tier, arredondada para cima. */
  it("escala com o Tier e arredonda para cima", () => {
    expect(poolOf(soldier(1), IMPLACABLE).max).toBe(1)
    expect(poolOf(soldier(5), IMPLACABLE).max).toBe(2)
    expect(poolOf(soldier(8), IMPLACABLE).max).toBe(2)
  })

  it("acumulador não tem teto", () => {
    expect(poolOf(soldier(1, ["Not Forgetting"]), NOT_FORGETTING).max).toBeNull()
  })
})

describe("activeTokenPools", () => {
  it("carta só conta no loadout", () => {
    const inVault = { ...soldier(1), vault: ["Refreshing Wind"] }
    const keys = activeTokenPools(inVault, derivedOf(inVault), TEST_COMPENDIUM).map(
      (active) => active.key,
    )

    expect(keys).not.toContain(REFRESHING_WIND)
  })
})

describe("tokenCount e setTokenCount", () => {
  it("começa cheio, e o acumulador começa zerado", () => {
    const character = soldier(5, ["Not Forgetting"])

    expect(tokenCount(character, poolOf(character, IMPLACABLE))).toBe(2)
    expect(tokenCount(character, poolOf(character, NOT_FORGETTING))).toBe(0)
  })

  it("grava por ficha: gastar numa não mexe na outra", () => {
    const first = soldier(5)
    const second = soldier(5)
    const spent = set(first, IMPLACABLE, 1)

    expect(tokenCount(spent, poolOf(spent, IMPLACABLE))).toBe(1)
    expect(tokenCount(second, poolOf(second, IMPLACABLE))).toBe(2)
  })

  it("não passa do teto nem fica negativo", () => {
    const character = soldier(1)

    expect(tokenCount(set(character, IMPLACABLE, 9), poolOf(character, IMPLACABLE))).toBe(1)
    expect(tokenCount(set(character, IMPLACABLE, -3), poolOf(character, IMPLACABLE))).toBe(0)
  })

  it("recusa fonte que a ficha não tem", () => {
    const result = setTokenCount(
      soldier(1),
      REFRESHING_WIND,
      1,
      derivedOf(soldier(1)),
      TEST_COMPENDIUM,
    )

    expect(result.ok ? null : result.code).toBe("tokenPoolUnknown")
  })
})

describe("descanso repõe os tokens", () => {
  it("o curto não repõe o que só volta no longo", () => {
    const rested = rest(set(soldier(5), IMPLACABLE, 0), "short")

    expect(tokenCount(rested, poolOf(rested, IMPLACABLE))).toBe(0)
  })

  it("o longo enche de novo", () => {
    const rested = rest(set(soldier(5), IMPLACABLE, 0), "long")

    expect(tokenCount(rested, poolOf(rested, IMPLACABLE))).toBe(2)
  })

  it("o acumulador zera no descanso que o limpa", () => {
    const character = set(soldier(1, ["Not Forgetting"]), NOT_FORGETTING, 4)
    const rested = rest(character, "short")

    expect(tokenCount(rested, poolOf(rested, NOT_FORGETTING))).toBe(0)
  })
})

describe("escalas e momentos de reposição", () => {
  const TECH_SAVVY = tokenPoolKey("card", "Tech Savvy", "Tech Savvy")

  it("Tech Savvy conta as cartas Edge do loadout e do vault", () => {
    const character = {
      ...soldier(9, ["Tech Savvy", "Lightning Reflexes"]),
      vault: ["Nimble", "Bare Bones"],
    }

    // Tech Savvy, Lightning Reflexes e Nimble são Edge; Bare Bones é Aegis.
    expect(poolOf(character, TECH_SAVVY).max).toBe(3)
  })

  it("carta com duas habilidades tem dois contadores separados", () => {
    const shared = tokenPoolKey("card", "Cron of Surik", "Shared Feature")
    const bonded = tokenPoolKey("card", "Cron of Surik", "Bonded Skill")
    const spent = set(soldier(9, ["Cron of Surik"]), shared, 0)

    expect(tokenCount(spent, poolOf(spent, shared))).toBe(0)
    expect(tokenCount(spent, poolOf(spent, bonded))).toBe(2)
  })
})

/*
 * `Determination Dice` não é contagem: cada token é um d4 já rolado, e o
 * **valor** dele é a regra — 3 de dano reduzido, +3 numa rolagem, 3 de Hope.
 */
describe("fonte de dado guardado", () => {
  const adept = (forcewield: number): Character => ({
    ...createCharacter("Jedi"),
    className: "Adept",
    subclass: "Warden",
    // O Forcewield do Warden é Knowledge — ver `TEST_COMPENDIUM`.
    traits: { ...createCharacter().traits, Knowledge: forcewield },
  })

  const sequence = (...values: number[]) => {
    let index = 0

    return () => values[index++] ?? 1
  }

  const roll = (character: Character, random: () => number) =>
    unwrap(rollTokenDice(character, DETERMINATION, derivedOf(character), TEST_COMPENDIUM, random))

  it("nasce vazia: o dado só existe depois de rolado", () => {
    const character = adept(3)

    expect(tokenDice(character, poolOf(character, DETERMINATION))).toEqual([])
    expect(tokenCount(character, poolOf(character, DETERMINATION))).toBe(0)
  })

  it("rola tantos dados quanto o atributo manda, guardando o que caiu", () => {
    const rolled = roll(adept(3), sequence(4, 1, 3))

    expect(tokenDice(rolled, poolOf(rolled, DETERMINATION))).toEqual([4, 1, 3])
  })

  /* "with a minimum of 1": atributo zero ainda dá um dado. */
  it("o piso do teto vale para a quantidade de dados", () => {
    const rolled = roll(adept(0), sequence(2))

    expect(tokenDice(rolled, poolOf(rolled, DETERMINATION))).toEqual([2])
  })

  /* "Clear any unspent dice before rolling": rolar de novo não acumula. */
  it("rolar de novo joga fora o que não foi gasto", () => {
    const rolled = roll(roll(adept(2), sequence(4, 4)), sequence(1, 2))

    expect(tokenDice(rolled, poolOf(rolled, DETERMINATION))).toEqual([1, 2])
  })

  /* Pela posição, e não pelo valor: dois dados podem ter caído no mesmo
     número, e gastar "o 3" apagaria o 3 da esquerda, que não é o apontado. */
  it("gasta o dado da posição apontada", () => {
    const rolled = roll(adept(3), sequence(3, 1, 3))
    const spent = unwrap(
      spendTokenDie(rolled, DETERMINATION, 2, derivedOf(rolled), TEST_COMPENDIUM),
    )

    expect(tokenDice(spent, poolOf(spent, DETERMINATION))).toEqual([3, 1])
    expect(spendTokenDie(spent, DETERMINATION, 5, derivedOf(spent), TEST_COMPENDIUM).ok).toBe(false)
  })

  it("aceita o valor rolado na mesa, dentro do dado e dentro do teto", () => {
    const character = adept(2)
    const posto = unwrap(addTokenDie(character, DETERMINATION, 3, derivedOf(character), TEST_COMPENDIUM))

    expect(tokenDice(posto, poolOf(posto, DETERMINATION))).toEqual([3])
    expect(addTokenDie(posto, DETERMINATION, 9, derivedOf(posto), TEST_COMPENDIUM)).toEqual({
      ok: false,
      code: "tokenDieOutOfRange",
      detail: "d4",
    })

    const cheio = unwrap(addTokenDie(posto, DETERMINATION, 1, derivedOf(posto), TEST_COMPENDIUM))

    expect(addTokenDie(cheio, DETERMINATION, 1, derivedOf(cheio), TEST_COMPENDIUM).ok).toBe(false)
  })

  /* O descanso longo rola a mão inteira: a ficha não fica esperando um toque
     que ninguém dá. */
  it("o descanso longo rola os dados sozinho", () => {
    const descansado = rest(adept(2), "long")

    expect(tokenDice(descansado, poolOf(descansado, DETERMINATION))).toHaveLength(2)
  })

  it("o descanso curto não mexe nos dados do descanso longo", () => {
    const rolled = roll(adept(2), sequence(4, 4))
    const descansado = rest(rolled, "short")

    expect(tokenDice(descansado, poolOf(descansado, DETERMINATION))).toEqual([4, 4])
  })
})
