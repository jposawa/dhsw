import { atomWithStorage } from "jotai/utils"

import { STORAGE_KEYS, STORAGE_VERSIONS } from "@/constants"
import { createVersionedStorage } from "@/services"
import type { RollRecord } from "@/types"

/**
 * As rolagens deste aparelho: a página pública de rolagem e as fichas sem
 * mesa. Da mais nova para a mais antiga, cortadas em `LOCAL_ROLL_LIMIT`.
 *
 * Só no navegador: é histórico de conveniência, e rolagem de mesa vive no
 * banco, onde todos veem.
 */
export const rollHistoryAtom = atomWithStorage<RollRecord[]>(
  STORAGE_KEYS.rollHistory,
  [],
  createVersionedStorage<RollRecord[]>({ version: STORAGE_VERSIONS.rollHistory, migrations: {} }),
  { getOnInit: true },
)
