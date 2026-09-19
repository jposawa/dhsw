import { describe, expect, it } from "vitest"

import { TEST_COMPENDIUM } from "@/compendium/testing"
import { DEFAULT_HOUSE_RULES } from "@/constants"
import { createCharacter } from "@/helpers"
import type { Advancement, Character } from "@/types"

import { derive } from "./derive"
import { canMulticlass, domainAccessFor, learnableSkills } from "./domainAccess"
import { learnSkill } from "./loadout"

const soldier = (level: number, advancements: Advancement[] = []): Character => ({
  ...createCharacter("Teste"),
  className: "Soldier",
  level,
  advancements,
})

describe("domainAccessFor (p. 111)", () => {
  it("domínios da classe até o nível do personagem", () => {
    expect(domainAccessFor(soldier(3), TEST_COMPENDIUM)).toEqual([
      { domain: "Aegis", maxLevel: 3 },
      { domain: "Havoc", maxLevel: 3 },
    ])
  })

  it("domínio de multiclasse até metade do nível, arredondando para cima", () => {
    const multiclass: Advancement = { level: 5, kind: "multiclass", detail: "Veil", slotsSpent: 2 }
    const access = domainAccessFor(soldier(5, [multiclass]), TEST_COMPENDIUM)

    expect(access).toContainEqual({ domain: "Veil", maxLevel: 3 })
  })
})

describe("learnableSkills", () => {
  it("não oferece carta acima do nível nem de outro domínio", () => {
    const skills = learnableSkills(soldier(2), TEST_COMPENDIUM)

    expect(skills.every((skill) => skill.level <= 2)).toBe(true)
    expect(skills.every((skill) => skill.domain === "Aegis" || skill.domain === "Havoc")).toBe(true)
  })

  it("learnSkill recusa carta que o personagem não alcança", () => {
    const tooHigh = TEST_COMPENDIUM.skills.find((skill) => skill.domain === "Aegis" && skill.level === 9)
    const hero = soldier(1)
    const result = learnSkill(
      hero,
      derive(hero, DEFAULT_HOUSE_RULES, TEST_COMPENDIUM),
      tooHigh?.name ?? "",
      TEST_COMPENDIUM,
    )

    expect(result.ok ? null : result.code).toBe("skillNotLearnable")
  })
})

describe("canMulticlass", () => {
  it("abre no Tier 3 pela regra", () => {
    expect(canMulticlass(4, DEFAULT_HOUSE_RULES)).toBe(false)
    expect(canMulticlass(5, DEFAULT_HOUSE_RULES)).toBe(true)
  })

  it("abre no Tier 2 com a regra da casa", () => {
    const houseRules = { ...DEFAULT_HOUSE_RULES, allowsEarlyMulticlass: true }

    expect(canMulticlass(1, houseRules)).toBe(false)
    expect(canMulticlass(2, houseRules)).toBe(true)
  })
})
