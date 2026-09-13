import { describe, expect, it } from "vitest"

import { FALLBACK_COMPENDIUM } from "@/compendium"
import { DEFAULT_HOUSE_RULES } from "@/constants"
import { createCharacter } from "@/helpers"
import type { Advancement, Character, HouseRules, InventoryEntry } from "@/types"

import { derive as deriveWith, tierOf } from "./derive"

const derive = (character: Character, houseRules: HouseRules) =>
  deriveWith(character, houseRules, FALLBACK_COMPENDIUM)

/*
 * Os números esperados aqui saem do Daggerheart Core Rulebook — página citada
 * em cada caso. Teste que diverge do livro está errado, não o livro.
 */

const withArmor = (character: Character, armorName: string): Character => {
  const entry: InventoryEntry = {
    id: "armor-entry",
    kind: "armor",
    name: armorName,
    isEquipped: true,
    slot: "armor",
    quantity: 1,
    installedModules: [],
    nickname: null,
  }

  return { ...character, inventory: [entry] }
}

const soldier = (level: number): Character => ({
  ...createCharacter("Teste"),
  className: "Soldier",
  level,
})

const withStrength = (character: Character, strength: number): Character => ({
  ...character,
  traits: { ...character.traits, Strength: strength },
})

describe("tierOf", () => {
  it("segue as faixas do livro: 1 / 2-4 / 5-7 / 8-10 (p. 109)", () => {
    expect(tierOf(1)).toBe(1)
    expect(tierOf(2)).toBe(2)
    expect(tierOf(4)).toBe(2)
    expect(tierOf(5)).toBe(3)
    expect(tierOf(7)).toBe(3)
    expect(tierOf(8)).toBe(4)
    expect(tierOf(10)).toBe(4)
  })

  it("trava fora da faixa em vez de estourar", () => {
    expect(tierOf(0)).toBe(1)
    expect(tierOf(99)).toBe(4)
  })
})

describe("derive — com armadura", () => {
  it("soma o nivel aos thresholds base: 7/15 no nivel 1 da 8/16 (p. 114)", () => {
    // Trooper Plate e linha Heavy T1, a mesma do Chainmail Armor: 7/15, score 4.
    const derived = derive(withArmor(soldier(1), "Trooper Plate"), DEFAULT_HOUSE_RULES)

    expect(derived.majorThreshold.total).toBe(8)
    expect(derived.severeThreshold.total).toBe(16)
    expect(derived.armorScore.total).toBe(4)
  })

  it("sobe um em cada threshold a cada nivel (p. 111)", () => {
    const derived = derive(withArmor(soldier(4), "Trooper Plate"), DEFAULT_HOUSE_RULES)

    expect([derived.majorThreshold.total, derived.severeThreshold.total]).toEqual([11, 19])
  })

  it("ignora Bare Bones no Loadout quando ha armadura vestida", () => {
    const character = { ...withArmor(soldier(1), "Trooper Plate"), loadout: ["Bare Bones"] }
    const derived = derive(character, DEFAULT_HOUSE_RULES)

    expect(derived.hasBareBones).toBe(false)
    expect(derived.armorScore.total).toBe(4)
  })
})

describe("derive — sem armadura (p. 114)", () => {
  it("Armor Score 0, sem importar o Strength", () => {
    const derived = derive(withStrength(soldier(1), 2), DEFAULT_HOUSE_RULES)

    expect(derived.isUnarmored).toBe(true)
    expect(derived.hasBareBones).toBe(false)
    expect(derived.armorScore.total).toBe(0)
  })

  it("Major igual ao nivel e Severe igual ao dobro do nivel", () => {
    expect(derive(soldier(1), DEFAULT_HOUSE_RULES).majorThreshold.total).toBe(1)
    expect(derive(soldier(1), DEFAULT_HOUSE_RULES).severeThreshold.total).toBe(2)
    expect(derive(soldier(6), DEFAULT_HOUSE_RULES).majorThreshold.total).toBe(6)
    expect(derive(soldier(6), DEFAULT_HOUSE_RULES).severeThreshold.total).toBe(12)
  })
})

describe("derive — Bare Bones no Loadout, sem armadura", () => {
  const bareBones = (level: number, strength: number): Character => ({
    ...withStrength(soldier(level), strength),
    loadout: ["Bare Bones"],
  })

  it("Armor Score 3 + Strength", () => {
    const derived = derive(bareBones(1, 2), DEFAULT_HOUSE_RULES)

    expect(derived.hasBareBones).toBe(true)
    expect(derived.armorScore.base).toBe(3)
    expect(derived.armorScore.total).toBe(5)
  })

  it("usa a tabela da carta mais o nivel: 9/19 no Tier 1", () => {
    const derived = derive(bareBones(1, 0), DEFAULT_HOUSE_RULES)

    expect([derived.majorThreshold.total, derived.severeThreshold.total]).toEqual([10, 20])
  })

  it("Tier 4 e 15/38, nao 15/35", () => {
    const derived = derive(bareBones(8, 0), DEFAULT_HOUSE_RULES)

    expect([derived.majorThreshold.base, derived.severeThreshold.base]).toEqual([15, 38])
    expect([derived.majorThreshold.total, derived.severeThreshold.total]).toEqual([23, 46])
  })

  it("so vale no Loadout: no vault a carta nao faz nada", () => {
    const character = { ...withStrength(soldier(1), 2), vault: ["Bare Bones"] }

    expect(derive(character, DEFAULT_HOUSE_RULES).armorScore.total).toBe(0)
  })
})

describe("derive — Proficiency", () => {
  it("comeca em 1 e ganha +1 nos niveis 2, 5 e 8 (p. 109)", () => {
    expect(derive(soldier(1), DEFAULT_HOUSE_RULES).proficiency.total).toBe(1)
    expect(derive(soldier(2), DEFAULT_HOUSE_RULES).proficiency.total).toBe(2)
    expect(derive(soldier(4), DEFAULT_HOUSE_RULES).proficiency.total).toBe(2)
    expect(derive(soldier(5), DEFAULT_HOUSE_RULES).proficiency.total).toBe(3)
    expect(derive(soldier(8), DEFAULT_HOUSE_RULES).proficiency.total).toBe(4)
  })

  it("soma o advancement e nunca passa de 6", () => {
    const advancements: Advancement[] = [5, 6, 7, 8, 9].map((level) => ({
      level,
      kind: "proficiency",
      detail: "",
      slotsSpent: 2,
    }))

    const derived = derive({ ...soldier(10), advancements }, DEFAULT_HOUSE_RULES)

    expect(derived.proficiency.total).toBe(6)
  })
})

describe("derive — cartas de dominio esperadas (p. 21, 111)", () => {
  it("duas no nivel 1, e mais uma por nivel", () => {
    expect(derive(soldier(1), DEFAULT_HOUSE_RULES).expectedCards).toBe(2)
    expect(derive(soldier(10), DEFAULT_HOUSE_RULES).expectedCards).toBe(11)
  })

  it("duas por nivel com a regra da casa", () => {
    const houseRules: HouseRules = { ...DEFAULT_HOUSE_RULES, hasTwoCardsPerLevel: true }

    expect(derive(soldier(10), houseRules).expectedCards).toBe(20)
  })
})

describe("derive — HP e Stress", () => {
  it("HP da classe e 6 de Stress, mais advancements", () => {
    const advancements: Advancement[] = [
      { level: 2, kind: "hp", detail: "", slotsSpent: 1 },
      { level: 3, kind: "stress", detail: "", slotsSpent: 1 },
    ]
    const derived = derive({ ...soldier(3), advancements }, DEFAULT_HOUSE_RULES)

    expect(derived.hitPointsMax.total).toBe(8)
    expect(derived.stressMax.total).toBe(7)
  })

  it("advancement guarda o nivel em que foi comprado", () => {
    const advancements: Advancement[] = [{ level: 2, kind: "hp", detail: "", slotsSpent: 1 }]
    const [modifier] = derive({ ...soldier(7), advancements }, DEFAULT_HOUSE_RULES)
      .hitPointsMax.modifiers

    expect(modifier.source).toEqual({ kind: "advancement", level: 2 })
  })
})

describe("derive — Evasion", () => {
  it("parte da classe e aplica o traco da armadura", () => {
    // Soldier tem Evasion 9; Heavy custa -1.
    const derived = derive(withArmor(soldier(1), "Trooper Plate"), DEFAULT_HOUSE_RULES)

    expect(derived.evasion.base).toBe(9)
    expect(derived.evasion.total).toBe(8)
  })

  it("nomeia a origem de cada modificador", () => {
    const derived = derive(withArmor(soldier(1), "Trooper Plate"), DEFAULT_HOUSE_RULES)
    const [modifier] = derived.evasion.modifiers

    expect(modifier.source).toEqual({
      kind: "armor",
      entryId: "armor-entry",
      name: "Trooper Plate",
      feature: "Heavy",
    })
    expect(modifier.value).toBe(-1)
  })

  it("nao cria modificador para a linha sem traco, que soma zero", () => {
    const derived = derive(withArmor(soldier(1), "Smuggler's Vest"), DEFAULT_HOUSE_RULES)

    expect(derived.evasion.modifiers).toHaveLength(0)
    expect(derived.evasion.total).toBe(9)
  })

  it("aplica a regra da casa de (Agility + Instinct) / 2", () => {
    const houseRules: HouseRules = { ...DEFAULT_HOUSE_RULES, hasEvasionFromTraits: true }
    const base = soldier(1)
    const character: Character = {
      ...base,
      traits: { ...base.traits, Agility: 2, Instinct: 3 },
    }

    expect(derive(character, houseRules).evasion.total).toBe(11)
    expect(derive(character, { ...houseRules, roundsEvasionUp: true }).evasion.total).toBe(12)
  })
})

describe("derive — Very Heavy modifica Agility, e o efeito propaga", () => {
  it("desconta 1 de Agility e isso muda a Evasion da regra da casa", () => {
    const houseRules: HouseRules = { ...DEFAULT_HOUSE_RULES, hasEvasionFromTraits: true }
    const base = soldier(1)
    const character = withArmor(
      { ...base, traits: { ...base.traits, Agility: 3, Instinct: 3 } },
      "Siege Carapace",
    )
    const derived = derive(character, houseRules)

    expect(derived.traits.Agility.base).toBe(3)
    expect(derived.traits.Agility.total).toBe(2)
    // (2 + 3) / 2 = 2.5 -> 2. Evasion 9 - 2 (Very Heavy) + 2 = 9.
    expect(derived.evasion.total).toBe(9)
  })
})

describe("derive — nada de derivado e guardado", () => {
  it("o mesmo personagem sempre produz o mesmo resultado", () => {
    const character = withArmor(soldier(5), "Hunter's Rig")

    expect(derive(character, DEFAULT_HOUSE_RULES)).toEqual(derive(character, DEFAULT_HOUSE_RULES))
  })
})

describe("derive — features com efeito permanente", () => {
  it("Human ganha um slot de Stress (High Stamina)", () => {
    const derived = derive({ ...soldier(1), ancestry: "Human" }, DEFAULT_HOUSE_RULES)

    expect(derived.stressMax.total).toBe(7)
    expect(derived.stressMax.modifiers[0].source).toEqual({
      kind: "ancestry",
      name: "Human",
      feature: "High Stamina",
    })
  })

  it("Juggernaut soma Defensive Layer conforme as cartas de subclasse que tem", () => {
    const juggernaut = withArmor({ ...soldier(5), subclass: "Juggernaut" }, "Trooper Plate")
    const upgrade: Advancement = { level: 5, kind: "subclass", detail: "", slotsSpent: 1 }

    // Trooper Plate 7/15 + nível 5 = 12/20, e a foundation dá +1.
    expect(derive(juggernaut, DEFAULT_HOUSE_RULES).majorThreshold.total).toBe(13)

    // Com a specialization, +2 a mais.
    const specialized = { ...juggernaut, advancements: [upgrade] }
    expect(derive(specialized, DEFAULT_HOUSE_RULES).severeThreshold.total).toBe(23)
  })

  it("subclasse de outra classe não vale", () => {
    const derived = derive({ ...soldier(1), subclass: "Wayseeker" }, DEFAULT_HOUSE_RULES)

    expect(derived.severeThreshold.modifiers).toHaveLength(1)
  })
})

describe("derive — features de equipamento (registro)", () => {
  const weaponEntry = (name: string, isEquipped: boolean): InventoryEntry => ({
    id: `weapon-${name}`,
    kind: "weapon",
    name,
    isEquipped,
    slot: isEquipped ? "secondary" : null,
    quantity: 1,
    installedModules: [],
    nickname: null,
  })

  it("Protective escala com o Tier do personagem", () => {
    const shielded = (level: number) => ({
      ...withArmor(soldier(level), "Trooper Plate"),
      inventory: [...withArmor(soldier(level), "Trooper Plate").inventory, weaponEntry("Riot Shield", true)],
    })

    // Trooper Plate T1 tem score 4; Protective soma o Tier.
    expect(derive(shielded(1), DEFAULT_HOUSE_RULES).armorScore.total).toBe(5)
    expect(derive(shielded(5), DEFAULT_HOUSE_RULES).armorScore.total).toBe(7)
  })

  it("feature de arma na mochila não vale", () => {
    const character = { ...soldier(1), inventory: [weaponEntry("Combat Staff", false)] }

    expect(derive(character, DEFAULT_HOUSE_RULES).evasion.total).toBe(9)
  })

  it("Guarding empunhada soma Evasion, com a arma e a feature nomeadas", () => {
    const character = { ...soldier(1), inventory: [weaponEntry("Combat Staff", true)] }
    const derived = derive(character, DEFAULT_HOUSE_RULES)

    expect(derived.evasion.total).toBe(10)
    expect(derived.evasion.modifiers[0].source).toEqual({
      kind: "weapon",
      entryId: "weapon-Combat Staff",
      name: "Combat Staff",
      feature: "Guarding",
    })
  })
})
