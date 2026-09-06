import { describe, expect, it } from 'vitest'

import { DEFAULT_HOUSE_RULES } from '@/constants'
import { createCharacter } from '@/helpers'
import type { Character, HouseRules, InventoryEntry } from '@/types'

import { derive, tierOf } from './derive'

const withArmor = (character: Character, armorName: string): Character => {
  const entry: InventoryEntry = {
    id: 'armor-entry',
    kind: 'armor',
    name: armorName,
    isEquipped: true,
    slot: 'armor',
    quantity: 1,
    installedModules: [],
    nickname: null,
  }

  return { ...character, inventory: [entry] }
}

const soldier = (level: number): Character => ({
  ...createCharacter('Teste'),
  className: 'Soldier',
  level,
})

describe('tierOf', () => {
  it('segue as faixas do SRD: 1 / 2-4 / 5-7 / 8-10', () => {
    expect(tierOf(1)).toBe(1)
    expect(tierOf(2)).toBe(2)
    expect(tierOf(4)).toBe(2)
    expect(tierOf(5)).toBe(3)
    expect(tierOf(7)).toBe(3)
    expect(tierOf(8)).toBe(4)
    expect(tierOf(10)).toBe(4)
  })

  it('trava fora da faixa em vez de estourar', () => {
    expect(tierOf(0)).toBe(1)
    expect(tierOf(99)).toBe(4)
  })
})

describe('derive — thresholds', () => {
  it('soma o nivel ao threshold base da armadura', () => {
    // Trooper Plate e Heavy T1: base 7/15. dh-sw-v2-spec.md §4.4
    const character = withArmor(soldier(1), 'Trooper Plate')
    const derived = derive(character, DEFAULT_HOUSE_RULES)

    expect(derived.majorThreshold.total).toBe(8)
    expect(derived.severeThreshold.total).toBe(16)
  })

  it('reproduz o Soldier da v1 no nivel 1 — 8/16, a ancora da spec', () => {
    // "O Soldier da v1 (8/16 no Level 1) e exatamente a linha Heavy de Tier 1
    // — 7/15 mais o Level." dh-sw-v2-spec.md §4.4
    const derived = derive(withArmor(soldier(1), 'Trooper Plate'), DEFAULT_HOUSE_RULES)

    expect([derived.majorThreshold.total, derived.severeThreshold.total]).toEqual([8, 16])
  })
})

describe('derive — Bare Bones', () => {
  it('usa 3 + Strength e a tabela do SRD quando nao ha armadura', () => {
    const character: Character = {
      ...soldier(1),
      traits: { ...soldier(1).traits, Strength: 2 },
    }
    const derived = derive(character, DEFAULT_HOUSE_RULES)

    expect(derived.isBareBones).toBe(true)
    expect(derived.armorScore.total).toBe(5)
    // Tier 1 base 9/19, mais o nivel 1.
    expect(derived.majorThreshold.total).toBe(10)
    expect(derived.severeThreshold.total).toBe(20)
  })
})

describe('derive — Evasion', () => {
  it('parte da classe e aplica o modificador da linha de armadura', () => {
    // Soldier tem Evasion 9 na v2; Heavy custa -1.
    const derived = derive(withArmor(soldier(1), 'Trooper Plate'), DEFAULT_HOUSE_RULES)

    expect(derived.evasion.base).toBe(9)
    expect(derived.evasion.total).toBe(8)
  })

  it('nomeia a origem de cada modificador', () => {
    const derived = derive(withArmor(soldier(1), 'Trooper Plate'), DEFAULT_HOUSE_RULES)
    const [modifier] = derived.evasion.modifiers

    expect(modifier.source).toEqual({
      kind: 'armor',
      entryId: 'armor-entry',
      name: 'Trooper Plate',
    })
    expect(modifier.value).toBe(-1)
  })

  it('nao cria modificador para a linha Neutra, que soma zero', () => {
    // Fonte sem efeito nao entra na lista: "Neutra: +0" e ruido.
    const derived = derive(withArmor(soldier(1), "Smuggler's Vest"), DEFAULT_HOUSE_RULES)

    expect(derived.evasion.modifiers).toHaveLength(0)
    expect(derived.evasion.total).toBe(9)
  })

  it('aplica a regra da casa de (Agility + Instinct) / 2', () => {
    const houseRules: HouseRules = { ...DEFAULT_HOUSE_RULES, hasEvasionFromTraits: true }
    const base = soldier(1)
    const character: Character = {
      ...base,
      traits: { ...base.traits, Agility: 2, Instinct: 3 },
    }

    // 2.5 arredondado para baixo = 2.
    expect(derive(character, houseRules).evasion.total).toBe(11)

    // Para cima = 3.
    expect(
      derive(character, { ...houseRules, roundsEvasionUp: true }).evasion.total,
    ).toBe(12)
  })
})

describe('derive — Very Heavy modifica Agility, e o efeito propaga', () => {
  it('desconta 1 de Agility e isso muda a Evasion da regra da casa', () => {
    const houseRules: HouseRules = { ...DEFAULT_HOUSE_RULES, hasEvasionFromTraits: true }
    const base = soldier(1)
    const character = withArmor(
      { ...base, traits: { ...base.traits, Agility: 3, Instinct: 3 } },
      'Siege Carapace',
    )
    const derived = derive(character, houseRules)

    expect(derived.traits.Agility.base).toBe(3)
    expect(derived.traits.Agility.total).toBe(2)
    // (2 + 3) / 2 = 2.5 -> 2. Evasion 9 - 2 (Very Heavy) + 2 = 9.
    expect(derived.evasion.total).toBe(9)
  })
})

describe('derive — nada de derivado e guardado', () => {
  it('o mesmo personagem sempre produz o mesmo resultado', () => {
    const character = withArmor(soldier(5), 'Hunter’s Rig')
    const first = derive(character, DEFAULT_HOUSE_RULES)
    const second = derive(character, DEFAULT_HOUSE_RULES)

    expect(first).toEqual(second)
  })
})
