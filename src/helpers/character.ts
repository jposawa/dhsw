import { CHARACTER_SCHEMA_VERSION, TRAIT_LIST } from '@/constants'
import type { Character, Trait } from '@/types'

/** Fabrica de ficha em branco. Pura — o id vem de `crypto.randomUUID`. */
export const createCharacter = (name = ''): Character => {
  const now = Date.now()

  return {
    id: crypto.randomUUID(),
    schema: CHARACTER_SCHEMA_VERSION,
    name,
    createdAt: now,
    updatedAt: now,
    ancestry: null,
    community: null,
    className: null,
    subclass: null,
    level: 1,
    traits: TRAIT_LIST.reduce(
      (traits, trait) => ({ ...traits, [trait]: 0 }),
      {} as Record<Trait, number>,
    ),
    marks: { hp: 0, stress: 0, armor: 0, hope: 0 },
    loadout: [],
    vault: [],
    inventory: [],
    advancements: [],
    experiences: [],
    notes: '',
  }
}

/** Copia de uma ficha: id novo, carimbos novos, o resto identico. */
export const duplicateCharacter = (source: Character): Character => {
  const name = `${source.name || 'Sem nome'} (cópia)`
  const now = Date.now()

  return { ...source, id: crypto.randomUUID(), name, createdAt: now, updatedAt: now }
}

/** Marca a ficha como alterada agora. Isola o `Date.now` do corpo do componente. */
export const touchCharacter = (character: Character): Character => ({
  ...character,
  updatedAt: Date.now(),
})
