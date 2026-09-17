import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

import { DEFAULT_HOUSE_RULES, STORAGE_KEYS, STORAGE_VERSIONS } from "@/constants"
import { rosterV1ToV2, rosterV2ToV3, rosterV3ToV4 } from "@/helpers"
import { createVersionedStorage } from "@/services"
import type { Character, RosterState } from "@/types"

import { houseRulesStorage } from "./houseRulesAtom"

const EMPTY_ROSTER: RosterState = { characters: {}, order: [] }

const rosterStorage = createVersionedStorage<RosterState>({
  version: STORAGE_VERSIONS.roster,
  migrations: {
    // Indice = versao de origem. Acumulativas: nenhuma sai daqui depois.
    1: rosterV1ToV2,
    2: rosterV2ToV3,
    // As regras que valiam para toda ficha até aqui eram as do aparelho.
    3: (value) =>
      rosterV3ToV4(value, houseRulesStorage.getItem(STORAGE_KEYS.houseRules, DEFAULT_HOUSE_RULES)),
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
