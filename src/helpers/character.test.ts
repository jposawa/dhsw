import { describe, expect, it } from "vitest"

import { DEFAULT_HOUSE_RULES, TRAIT_LIST } from "@/constants"
import type { Character } from "@/types"

import { createAdvancement } from "./advancement"
import {
  createCharacter,
  effectiveHouseRules,
  hasSheetEdits,
  normalizeCharacter,
} from "./character"

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

  /* O RTDB apaga a chave de valor `null` e guarda o `0`: o que volta sem
     chave nunca foi distribuído, e o zero distribuído volta como zero. */
  it("traco ausente volta como por distribuir, e o zero volta zero", () => {
    const parcial = {
      ...createCharacter(),
      traits: { Agility: 2, Strength: 0 },
    } as unknown as Character

    const normalized = normalizeCharacter(parcial)

    expect(normalized.traits.Agility).toBe(2)
    expect(normalized.traits.Strength).toBe(0)
    for (const trait of TRAIT_LIST.filter(
      (candidate) => candidate !== "Agility" && candidate !== "Strength",
    )) {
      expect(normalized.traits[trait]).toBeNull()
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

  /* Escolher avanço é a alteração de nível inteira: sem isto, trocar um
     avanço por outro dizia "nada alterado" e o Salvar ficava apagado. */
  it("acende ao escolher um avanço", () => {
    const saved = createCharacter("Rey")
    const draft = {
      ...saved,
      advancements: [createAdvancement(2, "trait", ["Agility", "Instinct"])],
    }

    expect(hasSheetEdits(draft, saved)).toBe(true)
    expect(hasSheetEdits({ ...draft, advancements: [] }, draft)).toBe(true)
  })

  it("ignora updatedAt, que muda em toda gravacao", () => {
    const saved = createCharacter("Rey")

    expect(hasSheetEdits({ ...saved, updatedAt: saved.updatedAt + 5000 }, saved)).toBe(false)
  })
})

describe("regras da casa da ficha", () => {
  const custom = { ...DEFAULT_HOUSE_RULES, hasCustomWeapons: true }
  const partyRules = { ...DEFAULT_HOUSE_RULES, loadoutSize: "4+tier" as const }

  it("ficha nova nasce com o modelo recebido", () => {
    expect(createCharacter("Rey", custom).houseRules).toEqual(custom)
  })

  it("ficha do banco sem regras, ou com regra nova faltando, recebe o padrão", () => {
    const stored = { ...createCharacter("Rey"), houseRules: { hasCustomWeapons: true } } as unknown as Character

    expect(normalizeCharacter(stored).houseRules).toEqual(custom)
  })

  it("mudar regra acende o Salvar", () => {
    const saved = createCharacter("Rey")

    expect(hasSheetEdits({ ...saved, houseRules: custom }, saved)).toBe(true)
  })

  it("fora de mesa valem as da ficha", () => {
    expect(effectiveHouseRules(createCharacter("Rey", custom), partyRules)).toEqual(custom)
  })

  it("em mesa valem as da mesa, e as da ficha só enquanto as da mesa não chegam", () => {
    const inParty = { ...createCharacter("Rey", custom), partyId: "mesa" }

    expect(effectiveHouseRules(inParty, partyRules)).toEqual(partyRules)
    expect(effectiveHouseRules(inParty, null)).toEqual(custom)
  })
})
