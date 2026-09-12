import { describe, expect, it } from "vitest"

import { TRAIT_LIST } from "@/constants"
import type { Character } from "@/types"

import { createCharacter, hasSheetEdits, normalizeCharacter } from "./character"

/**
 * O que o Realtime Database devolve de uma ficha que subiu com listas vazias:
 * ele apaga a chave em vez de guardar `[]`. Era o que derrubava a ficha ao
 * abrir — `resolveEquippedArmor` lia `character.inventory.find`.
 */
const asStoredByRtdb = (character: Character): Character => {
  const stripped = { ...character } as Record<string, unknown>

  for (const field of ["loadout", "vault", "inventory", "advancements", "experiences"]) {
    delete stripped[field]
  }

  return stripped as Character
}

describe("normalizeCharacter", () => {
  it("devolve as listas que o RTDB engoliu", () => {
    const normalized = normalizeCharacter(asStoredByRtdb(createCharacter("Rey")))

    expect(normalized.inventory).toEqual([])
    expect(normalized.loadout).toEqual([])
    expect(normalized.vault).toEqual([])
    expect(normalized.advancements).toEqual([])
    expect(normalized.experiences).toEqual([])
  })

  it("completa os seis tracos quando o zero nao foi gravado", () => {
    const stored = { ...createCharacter(), traits: undefined } as unknown as Character

    const normalized = normalizeCharacter(stored)

    for (const trait of TRAIT_LIST) {
      expect(normalized.traits[trait]).toBe(0)
    }
  })

  it("completa os marcadores sem inventar valor", () => {
    const stored = { ...createCharacter(), marks: { hp: 3 } } as unknown as Character

    expect(normalizeCharacter(stored).marks).toEqual({ hp: 3, stress: 0, armor: 0, hope: 0 })
  })

  it("nao mexe no que ja veio inteiro", () => {
    const character = createCharacter("Rey")

    expect(normalizeCharacter(character)).toEqual(character)
  })
})

describe("hasSheetEdits", () => {
  it("nao acende o salvar sem mudanca", () => {
    const saved = createCharacter("Rey")

    expect(hasSheetEdits({ ...saved }, saved)).toBe(false)
  })

  it("acende ao mexer num campo de identidade", () => {
    const saved = createCharacter("Rey")

    expect(hasSheetEdits({ ...saved, className: "Adept" }, saved)).toBe(true)
  })

  it("acende ao mexer num traco", () => {
    const saved = createCharacter("Rey")
    const draft = { ...saved, traits: { ...saved.traits, Agility: 2 } }

    expect(hasSheetEdits(draft, saved)).toBe(true)
  })

  /* Marcador grava no toque, no modo jogo: contá-lo aqui faria o Salvar
     acender por alguém ter marcado um Stress, e a ficha pareceria suja sem
     ninguém ter editado nada. */
  it("ignora marcador, que e estado de mesa e nao edicao", () => {
    const saved = createCharacter("Rey")
    const draft = { ...saved, marks: { ...saved.marks, stress: 3 } }

    expect(hasSheetEdits(draft, saved)).toBe(false)
  })

  it("ignora updatedAt, que muda em toda gravacao", () => {
    const saved = createCharacter("Rey")

    expect(hasSheetEdits({ ...saved, updatedAt: saved.updatedAt + 5000 }, saved)).toBe(false)
  })
})
