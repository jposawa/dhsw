import { describe, expect, it } from "vitest"

import { FALLBACK_COMPENDIUM } from "@/compendium"
import { DEFAULT_HOUSE_RULES } from "@/constants"
import { createCharacter } from "@/helpers"
import type { Character, DowntimeChoice, InventoryEntry } from "@/types"

import { derive } from "./derive"
import { movesForRest, takeRest } from "./downtime"

const armor: InventoryEntry = {
  id: "armor",
  kind: "armor",
  name: "Trooper Plate",
  isEquipped: true,
  slot: "armor",
  quantity: 1,
  installedModules: [],
  nickname: null,
}

const hurt = (level: number): Character => ({
  ...createCharacter("Ferido"),
  className: "Soldier",
  level,
  inventory: [armor],
  marks: { hp: 6, stress: 5, armor: 4, hope: 1 },
})

const choice = (moveId: string, extra: Partial<DowntimeChoice> = {}): DowntimeChoice => ({
  moveId,
  rolled: null,
  isOnAlly: false,
  isWithParty: false,
  ...extra,
})

const rest = (character: Character, kind: "short" | "long", choices: DowntimeChoice[]) =>
  takeRest(
    character,
    derive(character, DEFAULT_HOUSE_RULES, FALLBACK_COMPENDIUM),
    kind,
    choices,
    FALLBACK_COMPENDIUM,
  )

const marksOf = (result: ReturnType<typeof takeRest>) => (result.ok ? result.value.marks : null)

describe("movesForRest (p. 105)", () => {
  it("Rest tem quatro ações e Long Rest cinco", () => {
    expect(movesForRest(FALLBACK_COMPENDIUM, "short")).toHaveLength(4)
    expect(movesForRest(FALLBACK_COMPENDIUM, "long")).toHaveLength(5)
  })
})

describe("takeRest", () => {
  it("exige exatamente duas ações", () => {
    const result = rest(hurt(1), "short", [choice("clearStress", { rolled: 2 })])

    expect(result.ok ? null : result.code).toBe("downtimeNeedsTwoMoves")
  })

  it("recusa ação de outro descanso", () => {
    const result = rest(hurt(1), "short", [
      choice("clearAllStress"),
      choice("clearStress", { rolled: 1 }),
    ])

    expect(result.ok ? null : result.code).toBe("downtimeMoveUnknown")
  })

  it("Clear Stress limpa o dado mais o Tier", () => {
    // Nível 3 é Tier 2: 1 + 2 = 3 de Stress, duas vezes.
    const marks = marksOf(
      rest(hurt(3), "short", [choice("clearStress", { rolled: 1 }), choice("clearStress", { rolled: 1 })]),
    )

    expect(marks?.stress).toBe(0)
  })

  it("Tend to Wounds pede o resultado do dado", () => {
    const result = rest(hurt(1), "short", [choice("tendToWounds"), choice("prepareShort")])

    expect(result.ok ? null : result.code).toBe("downtimeRollMissing")
  })

  it("feita num aliado, a ação não mexe nesta ficha", () => {
    const marks = marksOf(
      rest(hurt(1), "short", [
        choice("tendToWounds", { rolled: 4, isOnAlly: true }),
        choice("repairArmor", { rolled: 2 }),
      ]),
    )

    expect(marks?.hp).toBe(6)
    expect(marks?.armor).toBe(1)
  })

  it("Prepare dá 1 Hope, ou 2 com o grupo, sem passar de 6", () => {
    expect(marksOf(rest(hurt(1), "short", [choice("prepareShort"), choice("prepareShort")]))?.hope).toBe(3)

    const hopeful = { ...hurt(1), marks: { ...hurt(1).marks, hope: 5 } }
    const withParty = choice("prepareShort", { isWithParty: true })

    expect(marksOf(rest(hopeful, "short", [withParty, withParty]))?.hope).toBe(6)
  })

  it("Long Rest limpa tudo do marcador escolhido", () => {
    const marks = marksOf(rest(hurt(1), "long", [choice("tendToAllWounds"), choice("repairAllArmor")]))

    expect(marks).toEqual({ hp: 0, stress: 5, armor: 0, hope: 1 })
  })

  it("Work on a Project não mexe em número", () => {
    const character = hurt(1)
    const marks = marksOf(rest(character, "long", [choice("workOnProject"), choice("workOnProject")]))

    expect(marks).toEqual(character.marks)
  })
})
