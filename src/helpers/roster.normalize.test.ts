import { describe, expect, it } from "vitest"

import type { Character, RosterState } from "@/types"

import { createCharacter } from "./character"
import { normalizeRoster } from "./roster"

/**
 * Como uma ficha podia estar guardada no aparelho: sem as listas vazias, que o
 * Realtime Database apaga e uma versão antiga do app chegou a gravar assim no
 * `localStorage`. Migração não conserta isso — ela só acrescenta campo novo.
 */
const asStoredWithoutLists = (character: Character): Character => {
  const stripped = { ...character } as Record<string, unknown>

  for (const field of ["inventory", "loadout", "vault", "advancements", "experiences", "tokens"]) {
    delete stripped[field]
  }

  return stripped as Character
}

const rosterWith = (character: Character): RosterState => ({
  characters: { [character.id]: character },
  order: [character.id, "fantasma"],
})

describe("normalizeRoster", () => {
  it("devolve as listas que faltavam na ficha guardada", () => {
    const broken = asStoredWithoutLists(createCharacter("Rey"))
    const normalized = normalizeRoster(rosterWith(broken)).characters[broken.id]

    expect(normalized.inventory).toEqual([])
    expect(normalized.loadout).toEqual([])
    expect(normalized.tokens).toEqual([])
    expect(normalized.advancements).toEqual([])
  })

  it("tira da ordem o id que não tem ficha", () => {
    const character = createCharacter("Rey")

    expect(normalizeRoster(rosterWith(character)).order).toEqual([character.id])
  })

  it("não mexe no que já está completo", () => {
    const character = createCharacter("Rey")

    expect(normalizeRoster(rosterWith(character)).characters[character.id]).toEqual(character)
  })
})
