import type { ArmorLineName, Tier } from '@/types'

/**
 * Constantes do SRD 2.0 conforme dh-sw-v2-spec.md.
 * So valores — a matematica que os consome vive em `rules/`.
 */

export const MIN_LEVEL = 1
export const MAX_LEVEL = 10

/** 6 para todas as classes, maximo 12 via advancement. §1.2 */
export const BASE_STRESS = 6
export const MAX_STRESS = 12
export const MAX_HIT_POINTS = 12

export const TIER_BOUNDARIES: readonly {
  tier: Tier
  minLevel: number
  maxLevel: number
}[] = [
  { tier: 1, minLevel: 1, maxLevel: 1 },
  { tier: 2, minLevel: 2, maxLevel: 4 },
  { tier: 3, minLevel: 5, maxLevel: 7 },
  { tier: 4, minLevel: 8, maxLevel: 10 },
]

/**
 * Modificadores por linha de armadura. `Very Heavy` tambem custa −1 de Agility.
 * Extraidos do rotulo do compendio para virarem numero uma vez so.
 */
export const ARMOR_LINE_MODIFIERS: Readonly<
  Record<ArmorLineName, { evasion: number; agility: number }>
> = {
  Flexible: { evasion: 1, agility: 0 },
  Neutra: { evasion: 0, agility: 0 },
  Heavy: { evasion: -1, agility: 0 },
  'Very Heavy': { evasion: -2, agility: -1 },
}

/**
 * Bare Bones — texto do SRD adotado na v2 (dh-sw-v2-spec.md §7.2).
 * Armor Score = 3 + Strength; thresholds base por tier.
 *
 * PENDENTE na spec: Tier 4 e 15/35 ou 15/38? Duas fontes divergem.
 * Fica 15/35 ate conferencia no PDF oficial.
 */
export const BARE_BONES_ARMOR_SCORE_BASE = 3

export const BARE_BONES_THRESHOLDS: Readonly<
  Record<Tier, { majorBase: number; severeBase: number }>
> = {
  1: { majorBase: 9, severeBase: 19 },
  2: { majorBase: 11, severeBase: 24 },
  3: { majorBase: 13, severeBase: 31 },
  4: { majorBase: 15, severeBase: 35 },
}

/** Loadout padrao do SRD. As alternativas sao regra da casa. */
export const DEFAULT_LOADOUT_SIZE = 5

/** Slots de modulo por item: Tier + 1. §4.5 — a conta vive em `rules/`. */
export const MODULE_SLOTS_OVER_TIER = 1
