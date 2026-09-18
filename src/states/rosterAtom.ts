import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import type { SyncStorage } from "jotai/vanilla/utils/atomWithStorage"

import { DEFAULT_HOUSE_RULES, STORAGE_KEYS, STORAGE_VERSIONS } from "@/constants"
import {
  normalizeRoster,
  rosterV1ToV2,
  rosterV2ToV3,
  rosterV3ToV4,
  rosterV4ToV5,
  rosterV5ToV6,
} from "@/helpers"
import { createVersionedStorage } from "@/services"
import type { Character, RosterState } from "@/types"

import { houseRulesStorage } from "./houseRulesAtom"

const EMPTY_ROSTER: RosterState = { characters: {}, order: [] }

const versionedStorage = createVersionedStorage<RosterState>({
  version: STORAGE_VERSIONS.roster,
  migrations: {
    // Indice = versao de origem. Acumulativas: nenhuma sai daqui depois.
    1: rosterV1ToV2,
    2: rosterV2ToV3,
    // As regras que valiam para toda ficha até aqui eram as do aparelho.
    3: (value) =>
      rosterV3ToV4(value, houseRulesStorage.getItem(STORAGE_KEYS.houseRules, DEFAULT_HOUSE_RULES)),
    4: rosterV4ToV5,
    5: rosterV5ToV6,
  },
})

/**
 * Toda leitura do roster passa por `normalizeRoster`: ficha guardada sem as
 * listas vazias — o que o Realtime Database devolve, e o que versões antigas
 * chegaram a gravar aqui — volta completa. Sem isto, uma ficha assim derruba
 * `derive` ao abrir, e nenhuma migração a conserta.
 */
const rosterStorage: SyncStorage<RosterState> = {
  ...versionedStorage,
  getItem: (key, initialValue) => normalizeRoster(versionedStorage.getItem(key, initialValue)),
}

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
