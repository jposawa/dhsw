import { describe, expect, it } from "vitest"

import { FALLBACK_COMPENDIUM } from "@/compendium"
import { createCharacter } from "@/helpers"
import type { Character, Result } from "@/types"

import { changeClass, changeSubclass, classChangeLoss, subclassUpgradesOf } from "./identity"

const unwrap = (result: Result<Character>): Character => {
  if (!result.ok) {
    throw new Error(`esperado ok, veio ${result.code}`)
  }

  return result.value
}

const [first, second] = FALLBACK_COMPENDIUM.classes
const subclassOf = (className: string) =>
  FALLBACK_COMPENDIUM.subclasses.find((subclass) => subclass.className === className)?.name ?? ""

const withCards = (): Character => ({
  ...createCharacter(),
  className: first.name,
  subclass: subclassOf(first.name),
  loadout: ["A"],
  vault: ["B", "C"],
  advancements: [{ level: 5, kind: "subclass", detail: "", slotsSpent: 1 }],
})

describe("changeClass", () => {
  it("limpa subclasse, loadout e vault", () => {
    const next = unwrap(changeClass(withCards(), second.name, FALLBACK_COMPENDIUM))

    expect(next.className).toBe(second.name)
    expect(next.subclass).toBeNull()
    expect(next.loadout).toEqual([])
    expect(next.vault).toEqual([])
  })

  /* Foram comprados por nível: a subclasse melhorada passa para a nova. */
  it("mantém os advancements", () => {
    const next = unwrap(changeClass(withCards(), second.name, FALLBACK_COMPENDIUM))

    expect(subclassUpgradesOf(next)).toBe(1)
  })

  it("a mesma classe não mexe em nada", () => {
    const character = withCards()

    expect(unwrap(changeClass(character, first.name, FALLBACK_COMPENDIUM))).toBe(character)
  })

  it("recusa classe fora do compêndio", () => {
    expect(changeClass(withCards(), "Jedi Cozinheiro", FALLBACK_COMPENDIUM).ok).toBe(false)
  })
})

describe("classChangeLoss", () => {
  it("conta subclasse e cartas das duas pilhas", () => {
    expect(classChangeLoss(withCards(), second.name)).toEqual({
      subclass: subclassOf(first.name),
      cardCount: 3,
    })
  })

  it("não há perda ficando na mesma classe", () => {
    expect(classChangeLoss(withCards(), first.name)).toEqual({
      subclass: null,
      cardCount: 0,
    })
  })
})

describe("changeSubclass", () => {
  it("aceita subclasse da classe", () => {
    const character = { ...createCharacter(), className: first.name }
    const name = subclassOf(first.name)

    expect(unwrap(changeSubclass(character, name, FALLBACK_COMPENDIUM)).subclass).toBe(name)
  })

  it("recusa subclasse de outra classe", () => {
    const character = { ...createCharacter(), className: first.name }

    expect(changeSubclass(character, subclassOf(second.name), FALLBACK_COMPENDIUM).ok).toBe(false)
  })
})
