import { describe, expect, it } from "vitest"

import { TEST_COMPENDIUM } from "@/compendium/testing"
import { DEFAULT_HOUSE_RULES } from "@/constants"
import type { AdvancementKind, Character, Level } from "@/types"

import {
  advancementSlots,
  availableAdvancements,
  changesFor,
  createAdvancement,
  markedTraits,
  picksAvailableFor,
  slotsFor,
} from "./advancement"
import { createCharacter } from "./character"
import { derive } from "./sheet"

const hero = (level: Level, advancements: Character["advancements"] = []): Character => ({
  ...createCharacter("Rey"),
  className: "Soldier",
  level,
  advancements,
  experiences: [
    { name: "Piloto", bonus: 2 },
    { name: "Ruas", bonus: 2 },
  ],
})

/** Os tipos oferecidos agora, sem o quanto ainda cabe. */
const offered = (character: Character, houseRules = DEFAULT_HOUSE_RULES): AdvancementKind[] =>
  availableAdvancements(character, houseRules).map(({ option }) => option.kind)

describe("changesFor", () => {
  it("cada avanço diz o que move", () => {
    expect(changesFor("hp", [])).toEqual([{ target: "hitPointsMax", value: 1 }])
    expect(changesFor("evasion", [])).toEqual([{ target: "evasion", value: 1 }])
    expect(changesFor("domainCard", [])).toEqual([{ target: "domainCards", value: 1 }])
  })

  /* O livro pede dois atributos de uma vez, e é o avanço inteiro que sobe os
     dois — não dois avanços de um. */
  it("o de atributo levanta os dois escolhidos, e recusa o que não é atributo", () => {
    expect(changesFor("trait", ["Agility", "Instinct"])).toEqual([
      { target: "trait.Agility", value: 1 },
      { target: "trait.Instinct", value: 1 },
    ])
    expect(changesFor("trait", ["Banana"])).toEqual([])
  })

  it("o de Experience levanta as duas escolhidas, pelo nome", () => {
    expect(changesFor("experience", ["Piloto", "Ruas"])).toEqual([
      { target: "experience.Piloto", value: 1 },
      { target: "experience.Ruas", value: 1 },
    ])
  })

  /* Multiclasse e subclasse mudam o que a ficha alcança, não quanto ela tem. */
  it("avanço sem número tem lista vazia", () => {
    expect(changesFor("multiclass", ["Veil"])).toEqual([])
    expect(changesFor("subclass", [])).toEqual([])
  })
})

describe("slotsFor", () => {
  it("proficiency e multiclasse custam os dois do nível", () => {
    expect(slotsFor("proficiency")).toBe(2)
    expect(slotsFor("multiclass")).toBe(2)
    expect(slotsFor("hp")).toBe(1)
  })
})

describe("advancementSlots", () => {
  /* O nível 1 é a criação: ele não dá avanço. */
  it("o nível 1 não dá avanço", () => {
    expect(advancementSlots(hero(1))).toEqual({ total: 0, spent: 0, remaining: 0 })
  })

  it("dois por nível a partir do segundo", () => {
    expect(advancementSlots(hero(2)).total).toBe(2)
    expect(advancementSlots(hero(5)).total).toBe(8)
  })

  it("conta o que foi gasto, com o dobro de quem custa dois", () => {
    const comprados = [createAdvancement(5, "hp"), createAdvancement(5, "proficiency")]

    expect(advancementSlots(hero(6, comprados))).toEqual({ total: 10, spent: 3, remaining: 7 })
  })

  /* Baixar o nível com avanços comprados não dá saldo negativo: a tela mostra
     zero a escolher, e a ficha continua com o que já tinha. */
  it("gastar mais do que o nível dá não vira saldo negativo", () => {
    const comprados = [createAdvancement(2, "proficiency"), createAdvancement(2, "proficiency")]

    expect(advancementSlots(hero(2, comprados)).remaining).toBe(0)
  })
})

describe("availableAdvancements", () => {
  /* O Tier 2 é a lista curta do livro: subclasse melhorada, Proficiency e
     multiclasse só existem do Tier 3 em diante (p. 110). */
  it("o Tier 2 não oferece subclasse, Proficiency nem multiclasse", () => {
    expect(offered(hero(3))).toEqual([
      "trait",
      "hp",
      "stress",
      "experience",
      "domainCard",
      "evasion",
    ])
  })

  it("o Tier 3 abre as três", () => {
    expect(offered(hero(5))).toContain("subclass")
    expect(offered(hero(5))).toContain("proficiency")
    expect(offered(hero(5))).toContain("multiclass")
  })

  /* A regra da casa adianta a multiclasse — e só ela: subclasse e Proficiency
     continuam fora do Tier 2. */
  it("com a regra da casa, o Tier 2 alcança a multiclasse, e nada além dela", () => {
    const houseRules = { ...DEFAULT_HOUSE_RULES, allowsEarlyMulticlass: true }
    const kinds = offered(hero(3), houseRules)

    expect(kinds).toContain("multiclass")
    expect(kinds).not.toContain("subclass")
    expect(kinds).not.toContain("proficiency")
  })

  it("o atributo cabe três vezes por tier, e não uma quarta", () => {
    const três = [
      createAdvancement(2, "trait", ["Agility", "Strength"]),
      createAdvancement(3, "trait", ["Finesse", "Instinct"]),
      createAdvancement(4, "trait", ["Presence", "Knowledge"]),
    ]

    const depoisDeDois = availableAdvancements(hero(3, três.slice(0, 2)), DEFAULT_HOUSE_RULES)

    expect(depoisDeDois.find(({ option }) => option.kind === "trait")?.remaining).toBe(1)
    expect(offered(hero(4, três))).not.toContain("trait")
  })

  /* Os slots são por tier: o que se gastou no anterior não ocupa nada aqui. */
  it("o tier novo devolve os slots do anterior", () => {
    const gastos = [
      createAdvancement(2, "trait", ["Agility", "Strength"]),
      createAdvancement(3, "trait", ["Finesse", "Instinct"]),
      createAdvancement(4, "trait", ["Presence", "Knowledge"]),
    ]

    expect(offered(hero(5, gastos))).toContain("trait")
  })

  it("quem melhorou a subclasse no tier não multiclassa nele, e vice-versa", () => {
    const comSubclasse = hero(6, [createAdvancement(5, "subclass")])
    const comMulticlasse = hero(6, [createAdvancement(5, "multiclass", ["Veil"])])

    expect(offered(comSubclasse)).not.toContain("multiclass")
    expect(offered(comMulticlasse)).not.toContain("subclass")
  })

  it("multiclasse é uma vez só na vida", () => {
    const jáMulticlassou = hero(8, [createAdvancement(5, "multiclass", ["Veil"])])

    expect(offered(jáMulticlassou)).not.toContain("multiclass")
  })

  /* Avanço que pede duas escolhas e não tem duas para oferecer não aparece:
     ele não teria como ser comprado. */
  it("some quem não tem o que escolher", () => {
    const semExperiences = { ...hero(3), experiences: [] }

    expect(offered(semExperiences)).not.toContain("experience")
  })

  it("o que custa dois some quando sobra um avanço", () => {
    // Nível 5 dá oito avanços. Com sete gastos sobra um, e Proficiency
    // precisa de dois.
    const seteGastos = [
      createAdvancement(5, "hp"),
      createAdvancement(5, "hp"),
      createAdvancement(5, "stress"),
      createAdvancement(5, "stress"),
      createAdvancement(5, "evasion"),
      createAdvancement(5, "domainCard"),
      createAdvancement(5, "trait", ["Agility", "Strength"]),
    ]

    expect(offered(hero(5, seteGastos.slice(0, 1)))).toContain("proficiency")
    expect(offered(hero(5, seteGastos))).not.toContain("proficiency")
  })
})

describe("markedTraits", () => {
  /* A marca é o que impede subir o mesmo atributo duas vezes no tier. Ela se
     limpa no level achievement do tier seguinte — níveis 5 e 8 (p. 109). */
  it("marca os atributos que subiram no tier", () => {
    const subiu = hero(3, [createAdvancement(2, "trait", ["Agility", "Instinct"])])

    expect(markedTraits(subiu)).toEqual(["Agility", "Instinct"])
    expect(picksAvailableFor(subiu, "trait")).toEqual([
      "Strength",
      "Finesse",
      "Presence",
      "Knowledge",
    ])
  })

  it("o tier novo limpa as marcas", () => {
    const subiu = hero(5, [createAdvancement(2, "trait", ["Agility", "Instinct"])])

    expect(markedTraits(subiu)).toEqual([])
  })
})

describe("o avanço move a ficha", () => {
  /* O que prova a fundação: `derive` não sabe o que é um avanço de HP — ele
     só repete o que o avanço carrega. */
  it("o HP comprado aparece no total derivado", () => {
    const sem = derive(hero(2), DEFAULT_HOUSE_RULES, TEST_COMPENDIUM)
    const com = derive(hero(2, [createAdvancement(2, "hp")]), DEFAULT_HOUSE_RULES, TEST_COMPENDIUM)

    expect(com.hitPointsMax.total).toBe(sem.hitPointsMax.total + 1)
    expect(com.hitPointsMax.modifiers).toContainEqual({
      target: "hitPointsMax",
      value: 1,
      source: { kind: "advancement", level: 2 },
    })
  })

  /* O bônus de Experience é o mesmo caso do atributo: o que a ficha guarda é
     a base, e o avanço entra como modificador — nunca editando o número. */
  it("a Experience melhorada soma por modificador, sem mexer na base", () => {
    const melhorada = hero(3, [createAdvancement(2, "experience", ["Piloto", "Ruas"])])
    const derived = derive(melhorada, DEFAULT_HOUSE_RULES, TEST_COMPENDIUM)
    const piloto = derived.experiences.find((experience) => experience.name === "Piloto")

    expect(melhorada.experiences[0].bonus).toBe(2)
    expect(piloto?.bonus).toEqual({
      base: 2,
      total: 3,
      modifiers: [
        { target: "experience.Piloto", value: 1, source: { kind: "advancement", level: 2 } },
      ],
    })
  })
})
