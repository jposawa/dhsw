import { describe, expect, it } from 'vitest'

import { CHARACTER_SCHEMA_VERSION } from '@/constants'
import type { Character, RosterState } from '@/types'

import { rosterV1ToV2 } from './migrations'

/**
 * Fixture do formato v1: ficha **sem** `partyId` e com `schema: 1`. Escrita à
 * mão de propósito — usar `createCharacter` aqui testaria o formato de hoje,
 * não o que está gravado no aparelho de alguém.
 */
const V1_ROSTER = {
  characters: {
    'sheet-1': {
      id: 'sheet-1',
      schema: 1,
      name: 'Kael',
      createdAt: 1_700_000_000_000,
      updatedAt: 1_700_000_000_000,
      ancestry: 'Human',
      community: null,
      className: 'Soldier',
      subclass: null,
      level: 3,
      traits: {
        Agility: 1,
        Strength: 2,
        Finesse: 0,
        Instinct: 0,
        Presence: -1,
        Knowledge: 0,
      },
      marks: { hp: 1, stress: 2, armor: 0, hope: 3 },
      loadout: ['Bare Bones'],
      vault: [],
      inventory: [],
      advancements: [],
      experiences: [],
      notes: '',
    },
  },
  order: ['sheet-1'],
}

describe('rosterV1ToV2', () => {
  it('acrescenta partyId nulo', () => {
    const migrated = rosterV1ToV2(V1_ROSTER)

    expect(migrated.characters['sheet-1'].partyId).toBeNull()
  })

  it('sobe o schema da ficha junto, nao so o do pacote', () => {
    const migrated = rosterV1ToV2(V1_ROSTER)

    expect(migrated.characters['sheet-1'].schema).toBe(CHARACTER_SCHEMA_VERSION)
  })

  it('preserva o resto da ficha intacto', () => {
    const migrated = rosterV1ToV2(V1_ROSTER)
    const character = migrated.characters['sheet-1']

    expect(character.name).toBe('Kael')
    expect(character.level).toBe(3)
    expect(character.marks).toEqual({ hp: 1, stress: 2, armor: 0, hope: 3 })
    expect(character.loadout).toEqual(['Bare Bones'])
    expect(character.traits.Strength).toBe(2)
  })

  it('preserva a ordem', () => {
    expect(rosterV1ToV2(V1_ROSTER).order).toEqual(['sheet-1'])
  })

  it('nao apaga partyId de quem ja tem', () => {
    const withParty = {
      ...V1_ROSTER,
      characters: {
        'sheet-1': { ...V1_ROSTER.characters['sheet-1'], partyId: 'party-9' },
      },
    }

    expect(rosterV1ToV2(withParty).characters['sheet-1'].partyId).toBe('party-9')
  })

  it('aguenta pacote vazio ou corrompido sem explodir', () => {
    // O `localStorage` pode ter qualquer coisa: outra aba, versao antiga,
    // edicao manual. Migracao que lanca aqui derruba o app no boot.
    expect(rosterV1ToV2(null)).toEqual({ characters: {}, order: [] })
    expect(rosterV1ToV2({})).toEqual({ characters: {}, order: [] })
  })
})

describe('formato v2 atual', () => {
  it('a ficha migrada tem a mesma forma que uma nova', () => {
    const migrated = rosterV1ToV2(V1_ROSTER).characters['sheet-1'] as Character
    const roster: RosterState = { characters: { 'sheet-1': migrated }, order: ['sheet-1'] }

    // Rodar de novo nao pode mudar mais nada: a migracao e idempotente.
    expect(rosterV1ToV2(roster)).toEqual(roster)
  })
})
