import { describe, expect, it } from "vitest"

import { TEST_COMPENDIUM } from "@/compendium/testing"
import { MIXED_ANCESTRY } from "@/constants"
import type { Character, Heritage } from "@/types"

import { createCharacter } from "./character"
import { featureNameOf, heritageFeatures, heritageLabel, NO_HERITAGE } from "./heritage"

const withHeritage = (heritage: Partial<Heritage>): Character => ({
  ...createCharacter("Rey"),
  heritage: { ...NO_HERITAGE, ...heritage },
})

const human = (): Character => withHeritage({ ancestry: "Human" })

/* Mista: o código é o da mista, e a espécie de cada feature vem à parte. */
const mixed = (): Character =>
  withHeritage({ ancestry: MIXED_ANCESTRY, firstAncestry: "Human", secondAncestry: "Twilek" })

const featuresOf = (character: Character) =>
  heritageFeatures(character, TEST_COMPENDIUM).map(
    (feature) => `${feature.ancestry}: ${feature.name}`,
  )

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

  /* O livro deixa o nome da mistura a cargo da mesa: quando ela deu um, é
     ele que vale, não o par de espécies. */
  it("na mista, o nome da mesa vem na frente", () => {
    const named = { ...mixed(), heritage: { ...mixed().heritage, label: "Corelliano" } }

    expect(heritageLabel(named)).toBe("Corelliano")
  })

  it("mista sem nenhuma espécie ainda não diz nada", () => {
    expect(heritageLabel(withHeritage({ ancestry: MIXED_ANCESTRY }))).toBeNull()
  })
})
