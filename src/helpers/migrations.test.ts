import { describe, expect, it } from "vitest"

import { CHARACTER_SCHEMA_VERSION, DEFAULT_HOUSE_RULES } from "@/constants"
import type { Character, RosterState } from "@/types"

import {
  houseRulesV1ToV2,
  rosterV1ToV2,
  rosterV2ToV3,
  rosterV3ToV4,
  rosterV4ToV5,
  rosterV5ToV6,
} from "./migrations"

/**
 * Fixture do formato v1: ficha **sem** `partyId` e com `schema: 1`. Escrita à
 * mão de propósito — usar `createCharacter` aqui testaria o formato de hoje,
 * não o que está gravado no aparelho de alguém.
 */
const V1_ROSTER = {
  characters: {
    "sheet-1": {
      id: "sheet-1",
      schema: 1,
      name: "Kael",
      createdAt: 1_700_000_000_000,
      updatedAt: 1_700_000_000_000,
      ancestry: "Human",
      community: null,
      className: "Soldier",
      subclass: null,
      level: 3,
      traits: {
        Agility: 1,
        Strength: 2,
        Finesse: 0,
        Instinct: 0,
        Presence: -1,
        Knowledge: 0,
      },
      marks: { hp: 1, stress: 2, armor: 0, hope: 3 },
      loadout: ["Bare Bones"],
      vault: [],
      inventory: [],
      advancements: [],
      experiences: [],
      notes: "",
    },
  },
  order: ["sheet-1"],
}

describe("rosterV1ToV2", () => {
  it("acrescenta partyId nulo", () => {
    const migrated = rosterV1ToV2(V1_ROSTER)

    expect(migrated.characters["sheet-1"].partyId).toBeNull()
  })

  it("sobe o schema da ficha junto, nao so o do pacote", () => {
    const migrated = rosterV1ToV2(V1_ROSTER)

    expect(migrated.characters["sheet-1"].schema).toBe(2)
  })

  it("preserva o resto da ficha intacto", () => {
    const migrated = rosterV1ToV2(V1_ROSTER)
    const character = migrated.characters["sheet-1"]

    expect(character.name).toBe("Kael")
    expect(character.level).toBe(3)
    expect(character.marks).toEqual({ hp: 1, stress: 2, armor: 0, hope: 3 })
    expect(character.loadout).toEqual(["Bare Bones"])
    expect(character.traits.Strength).toBe(2)
  })

  it("preserva a ordem", () => {
    expect(rosterV1ToV2(V1_ROSTER).order).toEqual(["sheet-1"])
  })

  it("nao apaga partyId de quem ja tem", () => {
    const withParty = {
      ...V1_ROSTER,
      characters: {
        "sheet-1": { ...V1_ROSTER.characters["sheet-1"], partyId: "party-9" },
      },
    }

    expect(rosterV1ToV2(withParty).characters["sheet-1"].partyId).toBe("party-9")
  })

  it("aguenta pacote vazio ou corrompido sem explodir", () => {
    // O `localStorage` pode ter qualquer coisa: outra aba, versao antiga,
    // edicao manual. Migracao que lanca aqui derruba o app no boot.
    expect(rosterV1ToV2(null)).toEqual({ characters: {}, order: [] })
    expect(rosterV1ToV2({})).toEqual({ characters: {}, order: [] })
  })
})

describe("formato v2 atual", () => {
  it("a ficha migrada tem a mesma forma que uma nova", () => {
    const migrated = rosterV1ToV2(V1_ROSTER).characters["sheet-1"] as Character
    const roster: RosterState = { characters: { "sheet-1": migrated }, order: ["sheet-1"] }

    // Rodar de novo nao pode mudar mais nada: a migracao e idempotente.
    expect(rosterV1ToV2(roster)).toEqual(roster)
  })
})

describe("houseRulesV1ToV2", () => {
  it("mantém o que a mesa escolheu e liga as regras novas desligadas", () => {
    const migrated = houseRulesV1ToV2({ hasTwoCardsPerLevel: true, loadoutSize: "4+tier" })

    expect(migrated.hasTwoCardsPerLevel).toBe(true)
    expect(migrated.loadoutSize).toBe("4+tier")
    expect(migrated.hasCustomWeapons).toBe(false)
  })
})

describe("rosterV2ToV3", () => {
  const v2 = rosterV1ToV2(V1_ROSTER)

  it("acrescenta tokens vazio e sobe o schema para 3", () => {
    const character = rosterV2ToV3(v2).characters["sheet-1"]

    expect(character.tokens).toEqual([])
    expect(character.schema).toBe(3)
  })

  it("preserva o resto da ficha", () => {
    const character = rosterV2ToV3(v2).characters["sheet-1"]

    expect(character.marks).toEqual({ hp: 1, stress: 2, armor: 0, hope: 3 })
    expect(character.partyId).toBeNull()
  })
})

describe("rosterV3ToV4", () => {
  const v3 = rosterV2ToV3(rosterV1ToV2(V1_ROSTER))
  const deviceRules = { ...DEFAULT_HOUSE_RULES, hasTwoCardsPerLevel: true }

  /* Até aqui a ficha calculava com as regras do aparelho: elas viram as dela,
     e nenhum número muda sozinho na atualização. */
  it("dá à ficha as regras que valiam no aparelho e sobe o schema para 4", () => {
    const character = rosterV3ToV4(v3, deviceRules).characters["sheet-1"]

    expect(character.houseRules).toEqual(deviceRules)
    expect(character.schema).toBe(4)
  })
})

describe("rosterV4ToV5", () => {
  const v4 = rosterV3ToV4(rosterV2ToV3(rosterV1ToV2(V1_ROSTER)), DEFAULT_HOUSE_RULES)

  /* Ficha antiga tem espécie única: as duas features vêm dela. */
  it("acrescenta a espécie mista vazia e sobe o schema para 5", () => {
    const character = rosterV4ToV5(v4).characters["sheet-1"] as unknown as {
      ancestry: string | null
      mixedAncestry: string | null
      schema: number
    }

    expect(character.mixedAncestry).toBeNull()
    expect(character.ancestry).toBe("Human")
    expect(character.schema).toBe(5)
  })
})

describe("rosterV5ToV6", () => {
  const v5 = rosterV4ToV5(rosterV3ToV4(rosterV2ToV3(rosterV1ToV2(V1_ROSTER)), DEFAULT_HOUSE_RULES))
  const heritageOf = (roster: RosterState) => roster.characters["sheet-1"].heritage

  it("espécie única vira o código da ascendência, sem nome nem escolhas", () => {
    expect(heritageOf(rosterV5ToV6(v5))).toEqual({
      ancestry: "Human",
      label: null,
      firstAncestry: null,
      secondAncestry: null,
    })
    expect(rosterV5ToV6(v5).characters["sheet-1"].schema).toBe(CHARACTER_SCHEMA_VERSION)
  })

  /* Na v5 a espécie mista era um campo solto ao lado da espécie: a primeira
     feature vinha da espécie e a segunda do campo solto. */
  it("mista guarda o código da mista e a espécie de cada feature", () => {
    const stored = v5.characters["sheet-1"] as unknown as Record<string, unknown>
    const mixed: RosterState = {
      ...v5,
      characters: { "sheet-1": { ...stored, mixedAncestry: "Twilek" } as unknown as Character },
    }

    expect(heritageOf(rosterV5ToV6(mixed))).toEqual({
      ancestry: "mixed",
      label: null,
      firstAncestry: "Human",
      secondAncestry: "Twilek",
    })
  })
})
