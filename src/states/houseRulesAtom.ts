import { atomWithStorage } from "jotai/utils"

import { DEFAULT_HOUSE_RULES, STORAGE_KEYS, STORAGE_VERSIONS } from "@/constants"
import { houseRulesV1ToV2 } from "@/helpers"
import { createVersionedStorage } from "@/services"
import type { HouseRules } from "@/types"

export const houseRulesStorage = createVersionedStorage<HouseRules>({
  version: STORAGE_VERSIONS.houseRules,
  migrations: {
    // Índice = versão de origem. Acumulativas: nenhuma sai daqui depois.
    1: houseRulesV1ToV2,
  },
})

/**
 * O **modelo** de regras da casa: o que uma ficha nova recebe. Não é o que
 * vale numa ficha existente — essa tem as dela, e em mesa valem as da mesa.
 * Editado na aba de regras do perfil.
 */
export const houseRulesAtom = atomWithStorage<HouseRules>(
  STORAGE_KEYS.houseRules,
  DEFAULT_HOUSE_RULES,
  houseRulesStorage,
  { getOnInit: true },
)
