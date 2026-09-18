import { describe, expect, it } from "vitest"

import { TEST_COMPENDIUM } from "@/compendium/testing"
import type { Character } from "@/types"

import { createCharacter } from "./character"
import { featureNameOf, heritageFeatures, heritageLabel } from "./heritage"

const human = (): Character => ({ ...createCharacter("Rey"), ancestry: "Human" })
const mixed = (): Character => ({ ...human(), mixedAncestry: "Twilek" })

const featuresOf = (character: Character) =>
  heritageFeatures(character, TEST_COMPENDIUM).map((feature) => `${feature.ancestry}: ${feature.name}`)

describe("featureNameOf", () => {
  it("tira o nome em negrito do começo da feature", () => {
    expect(featureNameOf("**High Stamina** — Ganhe um slot.")).toBe("High Stamina")
    expect(featureNameOf("Sem nome em negrito.")).toBeNull()
  })
})

describe("heritageFeatures (p. 70–71)", () => {
  it("espécie única dá as duas features dela", () => {
    expect(featuresOf(human())).toEqual(["Human: High Stamina", "Human: Adaptability"])
  })

  /* A primeira feature de uma espécie e a segunda de outra — nunca as duas
     da mesma, que é a regra que a mista tem. */
  it("mista pega a primeira de uma e a segunda da outra", () => {
    expect(featuresOf(mixed())).toEqual(["Human: High Stamina", "Twilek: Heat Adapted"])
  })

  it("sem espécie, não há feature", () => {
    expect(featuresOf(createCharacter("Rey"))).toEqual([])
  })
})

describe("heritageLabel", () => {
  it("junta as duas espécies, e sozinha fica só o nome", () => {
    expect(heritageLabel(mixed())).toBe("Human-Twilek")
    expect(heritageLabel(human())).toBe("Human")
    expect(heritageLabel(createCharacter("Rey"))).toBeNull()
  })
})
