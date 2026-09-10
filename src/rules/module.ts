import { MODULE_SLOTS_OVER_TIER } from "@/constants"
import type { Tier } from "@/types"

/** Slots de modulo por item: Tier + 1. dh-sw-v2-spec.md §4.5 */
export const moduleSlotsForTier = (tier: Tier): number => tier + MODULE_SLOTS_OVER_TIER
