import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { STORAGE_KEYS, STORAGE_VERSIONS } from '@/constants'
import { rosterV1ToV2 } from '@/helpers'
import { createVersionedStorage } from '@/services'
import type { Character, RosterState } from '@/types'

const EMPTY_ROSTER: RosterState = { characters: {}, order: [] }

const rosterStorage = createVersionedStorage<RosterState>({
  version: STORAGE_VERSIONS.roster,
  migrations: {
    // Indice = versao de origem. Acumulativas: nenhuma sai daqui depois.
    1: rosterV1ToV2,
  },
})

export const rosterAtom = atomWithStorage<RosterState>(
  STORAGE_KEYS.roster,
  EMPTY_ROSTER,
  rosterStorage,
  { getOnInit: true },
)

/** Lista ordenada, para o roster. Derivado — nao guarda nada. */
export const charactersAtom = atom((get) => {
  const roster = get(rosterAtom)

  return roster.order
    .map((id) => roster.characters[id])
    .filter((character): character is Character => Boolean(character))
})
