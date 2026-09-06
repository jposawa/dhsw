import { atomWithStorage } from 'jotai/utils'

import { DEFAULT_HOUSE_RULES, STORAGE_KEYS, STORAGE_VERSIONS } from '@/constants'
import { createVersionedStorage } from '@/services'
import type { HouseRules } from '@/types'

export const houseRulesAtom = atomWithStorage<HouseRules>(
  STORAGE_KEYS.houseRules,
  DEFAULT_HOUSE_RULES,
  createVersionedStorage<HouseRules>({
    version: STORAGE_VERSIONS.houseRules,
    migrations: {},
  }),
  { getOnInit: true },
)
