import type { Tier } from "@/types"

/**
 * Nível, tier e o que cresce com eles. Só valores — a conta vive em `rules/`.
 *
 * Fonte: Daggerheart Core Rulebook, "Leveling Up" (p. 109–111) e "Step 5"
 * da criação de personagem (p. 18).
 */

export const MIN_LEVEL = 1
export const MAX_LEVEL = 10

/** Tier 1 é só o nível 1; 2–4, 5–7 e 8–10. */
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
 * Níveis com level achievement: Experience nova a +2 e +1 permanente de
 * Proficiency. Em 5 e 8 também se limpam as marcas de atributo.
 */
export const LEVEL_ACHIEVEMENT_LEVELS: readonly number[] = [2, 5, 8]

/** "At Level 1, your Proficiency is 1." Nunca passa de 6. */
export const STARTING_PROFICIENCY = 1
export const MAX_PROFICIENCY = 6

/** Duas cartas de domínio na criação, e mais uma a cada nível. */
export const STARTING_DOMAIN_CARDS = 2
export const DOMAIN_CARDS_PER_LEVEL = 1

/** Máximo de cartas ativas. As alternativas são regra da casa. */
export const DEFAULT_LOADOUT_SIZE = 5

/** Duas Experiences na criação, e toda Experience nova nasce a +2. */
export const STARTING_EXPERIENCES = 2
export const NEW_EXPERIENCE_BONUS = 2

/** Duas ações de downtime por descanso; a mesma pode ser escolhida duas vezes. */
export const DOWNTIME_MOVES_PER_REST = 2
