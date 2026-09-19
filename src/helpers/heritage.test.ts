import { describe, expect, it } from "vitest"

import { TEST_COMPENDIUM } from "@/compendium/testing"
import { MIXED_ANCESTRY_LABEL } from "@/constants"
import type { Character, Heritage } from "@/types"

import { createCharacter } from "./character"
import {
  featureNameOf,
  heritageFeatures,
  heritageLabel,
  mixedAncestry,
  NO_HERITAGE,
  singleAncestry,
} from "./heritage"

const withHeritage = (heritage: Heritage): Character => ({
  ...createCharacter("Rey"),
  heritage,
})

const human = (): Character => withHeritage(singleAncestry("Human"))

/* Mista: duas fontes diferentes, e o nome a cargo da mesa. */
const mixed = (): Character =>
  withHeritage({ ...mixedAncestry(), sources: { first: "Human", second: "Twilek" } })

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

describe("singleAncestry", () => {
  /* As duas fontes apontando para a mesma espécie é o que faz espécie única e
     mista caberem no mesmo formato — quem lê não pergunta qual das duas é. */
  it("aponta as duas fontes para a espécie", () => {
    expect(singleAncestry("Human")).toEqual({
      name: "Human",
      sources: { first: "Human", second: "Human" },
      isMixed: false,
    })
  })
})

describe("mixedAncestry", () => {
  /* Trocar para mista é trocar de ascendência, não acrescentar uma metade à
     que estava: nada da anterior sobra. */
  it("nasce em branco, sem herdar nada da ascendência anterior", () => {
    expect(mixedAncestry()).toEqual({ ...NO_HERITAGE, isMixed: true })
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
  })

  /* O livro deixa o nome da mistura a cargo da mesa: quando ela deu um, é
     ele que vale, não o par de espécies. */
  it("na mista, o nome da mesa vem na frente", () => {
    const named = withHeritage({ ...mixed().heritage, name: "Corelliano" })

    expect(heritageLabel(named)).toBe("Corelliano")
  })

  /* Com metade do par escolhida, o nome da espécie sozinho fazia a ficha
     parecer de espécie única — era o que a tela mostrava como se fosse erro. */
  it("mista pela metade se chama mista, não pela espécie que já tem", () => {
    const half = withHeritage({ ...mixedAncestry(), sources: { first: "Human", second: null } })

    expect(heritageLabel(half)).toBe(MIXED_ANCESTRY_LABEL)
  })

  it("mista sem nenhuma espécie também se chama mista", () => {
    expect(heritageLabel(withHeritage(mixedAncestry()))).toBe(MIXED_ANCESTRY_LABEL)
  })

  it("sem ascendência nenhuma, não diz nada", () => {
    expect(heritageLabel(createCharacter("Rey"))).toBeNull()
  })
})
