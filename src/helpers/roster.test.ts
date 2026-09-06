import { describe, expect, it } from 'vitest'

import type { Character, RosterState } from '@/types'

import { createCharacter } from './character'
import { findUnsyncedCharacters, mergeRosters } from './roster'

const sheet = (id: string, name: string, updatedAt: number): Character => ({
  ...createCharacter(name),
  id,
  updatedAt,
})

const rosterOf = (...characters: Character[]): RosterState => ({
  characters: Object.fromEntries(characters.map((character) => [character.id, character])),
  order: characters.map((character) => character.id),
})

describe('mergeRosters', () => {
  it('mantem o lado mais recente quando a ficha existe nos dois', () => {
    const local = rosterOf(sheet('a', 'local mais nova', 200))
    const merged = mergeRosters(local, [sheet('a', 'remota mais velha', 100)])

    expect(merged.characters.a.name).toBe('local mais nova')
  })

  it('aceita o remoto quando ele e mais recente', () => {
    const local = rosterOf(sheet('a', 'local velha', 100))
    const merged = mergeRosters(local, [sheet('a', 'remota nova', 200)])

    expect(merged.characters.a.name).toBe('remota nova')
  })

  it('empate fica com o remoto, para os aparelhos convergirem', () => {
    const local = rosterOf(sheet('a', 'local', 100))
    const merged = mergeRosters(local, [sheet('a', 'remota', 100)])

    expect(merged.characters.a.name).toBe('remota')
  })

  it('traz ficha que so existe no remoto, no fim da ordem', () => {
    const local = rosterOf(sheet('a', 'minha', 100))
    const merged = mergeRosters(local, [sheet('b', 'de outro aparelho', 50)])

    expect(merged.order).toEqual(['a', 'b'])
    expect(Object.keys(merged.characters)).toHaveLength(2)
  })

  it('nao reordena o que ja estava na tela', () => {
    const local = rosterOf(sheet('a', 'a', 100), sheet('b', 'b', 100))
    const merged = mergeRosters(local, [sheet('b', 'b remota', 300)])

    expect(merged.order).toEqual(['a', 'b'])
  })

  it('preserva a ficha local que o remoto nao conhece', () => {
    const local = rosterOf(sheet('a', 'criada offline', 100))
    const merged = mergeRosters(local, [])

    expect(merged.characters.a).toBeDefined()
    expect(merged.order).toEqual(['a'])
  })

  it('nao deixa id na ordem sem ficha correspondente', () => {
    const local: RosterState = { characters: {}, order: ['fantasma'] }
    const merged = mergeRosters(local, [])

    expect(merged.order).toEqual([])
  })
})

describe('findUnsyncedCharacters', () => {
  it('acha o que existe so no local', () => {
    const roster = rosterOf(sheet('a', 'sincronizada', 100), sheet('b', 'orfa', 100))
    const orphans = findUnsyncedCharacters(roster, new Set(['a']))

    expect(orphans.map((character) => character.id)).toEqual(['b'])
  })

  it('devolve vazio quando tudo ja esta no servidor', () => {
    const roster = rosterOf(sheet('a', 'sincronizada', 100))

    expect(findUnsyncedCharacters(roster, new Set(['a']))).toEqual([])
  })
})
