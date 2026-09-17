import { describe, expect, it } from "vitest"

import { FALLBACK_COMPENDIUM } from "@/compendium"
import { DEFAULT_HOUSE_RULES } from "@/constants"
import { createCharacter } from "@/helpers"
import type { Character, DowntimeChoice, Result } from "@/types"

import { derive } from "./derive"
import { takeRest } from "./downtime"
import { activeTokenPools, enterCombat, setTokenCount, tokenCount, tokenPoolKey } from "./tokens"

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
  derive(character, DEFAULT_HOUSE_RULES, FALLBACK_COMPENDIUM)

const IMPLACABLE = tokenPoolKey("class", "Soldier", "Implacable")
const NOT_FORGETTING = tokenPoolKey("card", "Not Forgetting", "Not Forgetting")
const REFRESHING_WIND = tokenPoolKey("card", "Refreshing Wind", "Refreshing Wind")

const poolOf = (character: Character, key: string) => {
  const active = activeTokenPools(character, derivedOf(character), FALLBACK_COMPENDIUM).find(
    (candidate) => candidate.key === key,
  )

  if (!active) {
    throw new Error(`sem contador ${key}`)
  }

  return active
}

const set = (character: Character, key: string, count: number) =>
  unwrap(setTokenCount(character, key, count, derivedOf(character), FALLBACK_COMPENDIUM))

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
      FALLBACK_COMPENDIUM,
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
    const keys = activeTokenPools(inVault, derivedOf(inVault), FALLBACK_COMPENDIUM).map(
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
      FALLBACK_COMPENDIUM,
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

  it("modo combate repõe o que volta ao entrar em combate, e só isso", () => {
    const simus = tokenPoolKey("card", "Cron of Simus", "Cron of Simus")
    const spent = set(set(soldier(5, ["Cron of Simus"]), simus, 0), IMPLACABLE, 0)
    const fought = unwrap(enterCombat(spent, FALLBACK_COMPENDIUM))

    expect(tokenCount(fought, poolOf(fought, simus))).toBe(3)
    expect(tokenCount(fought, poolOf(fought, IMPLACABLE))).toBe(0)
  })

  it("carta com duas habilidades tem dois contadores separados", () => {
    const shared = tokenPoolKey("card", "Cron of Surik", "Shared Feature")
    const bonded = tokenPoolKey("card", "Cron of Surik", "Bonded Skill")
    const spent = set(soldier(9, ["Cron of Surik"]), shared, 0)

    expect(tokenCount(spent, poolOf(spent, shared))).toBe(0)
    expect(tokenCount(spent, poolOf(spent, bonded))).toBe(2)
  })
})
