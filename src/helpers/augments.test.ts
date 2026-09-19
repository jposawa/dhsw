import { describe, expect, it } from "vitest"

import { TEST_COMPENDIUM } from "@/compendium/testing"
import { DEFAULT_HOUSE_RULES } from "@/constants"
import { createCharacter } from "@/helpers"
import type { Character, InventoryEntry } from "@/types"

import { augmentRollBonuses, augmentSlotsFor, installAugment, removeAugment } from "./augments"
import { derive } from "./sheet"

const houseRules = { ...DEFAULT_HOUSE_RULES, hasCustomWeapons: true }

const blaster = (installedModules: string[] = [], isEquipped = true): InventoryEntry => ({
  id: "blaster",
  kind: "weapon",
  name: "Blaster Pistol",
  isEquipped,
  slot: isEquipped ? "primary" : null,
  quantity: 1,
  installedModules,
  nickname: null,
})

const armed = (level: number, installedModules: string[] = []): Character => ({
  ...createCharacter("Teste"),
  className: "Agent",
  level,
  inventory: [blaster(installedModules)],
})

const install = (character: Character, name: string, tier: 1 | 2 | 3 | 4, rules = houseRules) =>
  installAugment(character, "blaster", name, tier, rules, TEST_COMPENDIUM)

describe("augments (Motherboard, p. 300)", () => {
  it("Customizable (n) dá n + 1 slots, e arma sem a propriedade não tem slot", () => {
    const pistol = TEST_COMPENDIUM.weapons.find((weapon) => weapon.name === "Blaster Pistol")

    expect(augmentSlotsFor(pistol && { ...pistol, customizable: 2 })).toBe(3)
    expect(augmentSlotsFor(pistol && { ...pistol, customizable: null })).toBe(0)
  })

  it("recusa arma que não é Customizable", () => {
    const compendium = {
      ...TEST_COMPENDIUM,
      weapons: TEST_COMPENDIUM.weapons.map((weapon) => ({ ...weapon, customizable: null })),
    }
    const result = installAugment(armed(1), "blaster", "Amplifier", 1, houseRules, compendium)

    expect(result.ok ? null : result.code).toBe("weaponNotCustomizable")
  })

  it("os slots não crescem com o Tier do personagem", () => {
    const full = armed(8, ["Overcharged Cell", "Amplifier"])

    expect(install(full, "Guard Plating", 4).ok).toBe(false)
  })

  it("não instala sem a regra da casa", () => {
    const result = install(armed(1), "Overcharged Cell", 1, DEFAULT_HOUSE_RULES)

    expect(result.ok ? null : result.code).toBe("customWeaponsOff")
  })

  it("recusa augment de Tier acima do personagem", () => {
    expect(install(armed(1), "Superheated Core", 1).ok).toBe(false)
  })

  it("recusa o terceiro augment numa arma Customizable (1)", () => {
    const result = install(armed(1, ["Overcharged Cell", "Amplifier"]), "Guard Plating", 1)

    expect(result.ok ? null : result.code).toBe("augmentSlotsFull")
  })

  it("soma dano e ataque na rolagem da arma", () => {
    const entry = blaster(["Overcharged Cell", "Targeting Array"])

    expect(augmentRollBonuses(entry, houseRules, TEST_COMPENDIUM)).toEqual({ damageBonus: 1, attackBonus: 1 })
    expect(augmentRollBonuses(entry, DEFAULT_HOUSE_RULES, TEST_COMPENDIUM)).toEqual({ damageBonus: 0, attackBonus: 0 })
  })

  it("augment com modificador mexe na ficha com a arma equipada", () => {
    const derived = derive(armed(1, ["Deflector Emitter"]), houseRules, TEST_COMPENDIUM)

    expect(derived.armorScore.total).toBe(2)
  })

  it("tirar devolve o slot", () => {
    const result = removeAugment(armed(1, ["Amplifier"]), "blaster", "Amplifier")

    expect(result.ok ? result.value.inventory[0].installedModules : null).toEqual([])
  })
})
