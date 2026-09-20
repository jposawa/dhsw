import { describe, expect, it } from "vitest"

import { TEST_COMPENDIUM } from "@/compendium/testing"
import { DEFAULT_HOUSE_RULES } from "@/constants"
import type { Character, Level } from "@/types"

import { advancementSlots, changesFor, createAdvancement, slotsFor } from "./advancement"
import { createCharacter } from "./character"
import { derive } from "./sheet"

const hero = (level: Level, advancements: Character["advancements"] = []): Character => ({
  ...createCharacter("Rey"),
  className: "Soldier",
  level,
  advancements,
})

describe("changesFor", () => {
  it("cada avanço diz o que move", () => {
    expect(changesFor("hp", "")).toEqual([{ target: "hitPointsMax", value: 1 }])
    expect(changesFor("evasion", "")).toEqual([{ target: "evasion", value: 1 }])
    expect(changesFor("domainCard", "")).toEqual([{ target: "domainCards", value: 1 }])
  })

  it("o de atributo lê a escolha, e recusa o que não é atributo", () => {
    expect(changesFor("trait", "Agility")).toEqual([{ target: "trait.Agility", value: 1 }])
    expect(changesFor("trait", "Banana")).toEqual([])
  })

  /* Multiclasse e subclasse mudam o que a ficha alcança, não quanto ela tem. */
  it("avanço sem número tem lista vazia", () => {
    expect(changesFor("multiclass", "Veil")).toEqual([])
    expect(changesFor("subclass", "")).toEqual([])
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
    const comprados = [createAdvancement(2, "hp"), createAdvancement(2, "proficiency")]

    expect(advancementSlots(hero(3, comprados))).toEqual({ total: 4, spent: 3, remaining: 1 })
  })

  /* Baixar o nível com avanços comprados não dá saldo negativo: a tela mostra
     zero a escolher, e a ficha continua com o que já tinha. */
  it("gastar mais do que o nível dá não vira saldo negativo", () => {
    const comprados = [createAdvancement(2, "proficiency"), createAdvancement(2, "proficiency")]

    expect(advancementSlots(hero(2, comprados)).remaining).toBe(0)
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
})
