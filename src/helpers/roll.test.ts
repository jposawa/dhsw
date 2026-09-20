import { describe, expect, it } from "vitest"

import { TEST_COMPENDIUM } from "@/compendium/testing"
import { DEFAULT_HOUSE_RULES } from "@/constants"
import { createCharacter } from "@/helpers"
import type { Character, Weapon } from "@/types"

import { derive } from "./sheet"
import { parseDicePool } from "./dice"
import { presetForTrait, presetsForWeapon } from "./roll"

const agent = (level: number): Character => {
  const base = createCharacter("Rey")

  return {
    ...base,
    className: "Agent",
    level,
    // Explícito: a ficha nova nasce com o array espalhado, e este teste é
    // sobre o preparo da rolagem, não sobre o padrão de criação.
    traits: { ...base.traits, Finesse: 2, Agility: -1, Strength: 0 },
  }
}

const weaponNamed = (name: string): Weapon => {
  const weapon = TEST_COMPENDIUM.weapons.find((candidate) => candidate.name === name)

  if (!weapon) {
    throw new Error(`sem ${name}`)
  }

  return weapon
}

const derivedOf = (character: Character) =>
  derive(character, DEFAULT_HOUSE_RULES, TEST_COMPENDIUM)

describe("presetForTrait", () => {
  it("prepara Duality com o valor do atributo, e a expressão é válida", () => {
    const derived = derivedOf(agent(1))

    expect(presetForTrait("Finesse", derived)).toEqual({ label: "Finesse", expression: "duality+2" })
    expect(presetForTrait("Agility", derived).expression).toBe("duality-1")
    expect(presetForTrait("Strength", derived).expression).toBe("duality")
    expect(parseDicePool(presetForTrait("Agility", derived).expression)).not.toBeNull()
  })
})

describe("presetsForWeapon", () => {
  const noBonus = { attackBonus: 0, damageBonus: 0 }

  it("ataque com o atributo da arma, dano com Proficiency e bônus do tier", () => {
    // Nível 5: Tier 3 e Proficiency 3. Blaster Pistol: Finesse, d6, +7 no Tier 3.
    const presets = presetsForWeapon(weaponNamed("Blaster Pistol"), "Blaster Pistol", derivedOf(agent(5)), noBonus)

    expect(presets.attack).toEqual({ label: "Ataque · Blaster Pistol", expression: "duality+2" })
    expect(presets.damage).toEqual({ label: "Dano · Blaster Pistol", expression: "3d6+7" })
  })

  it("soma os bônus de augment e aceita bônus zero", () => {
    // Nível 1, Vibroknife: Finesse, d8, +0 no Tier 1.
    const presets = presetsForWeapon(weaponNamed("Vibroknife"), "Faca", derivedOf(agent(1)), {
      attackBonus: 1,
      damageBonus: 0,
    })

    expect(presets.attack.expression).toBe("duality+3")
    expect(presets.damage.expression).toBe("1d8")
  })

  it("arma de Forcewield sem subclasse que a tenha soma zero", () => {
    const forceWeapon = { ...weaponNamed("Blaster Pistol"), trait: "Forcewield" as const }

    expect(presetsForWeapon(forceWeapon, "Sabre", derivedOf(agent(1)), noBonus).attack.expression).toBe(
      "duality",
    )
  })
})
