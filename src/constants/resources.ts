/**
 * Marcadores de mesa: Hit Points, Stress, Hope e Armor Slots.
 *
 * Fonte: Daggerheart Core Rulebook, "Step 4" da criação (p. 18), "Using Armor"
 * (p. 114) e a ficha de personagem, que tem 12 espaços de HP e de Stress.
 */

/** Toda classe começa com 6 Stress. HP inicial é da classe. */
export const BASE_STRESS = 6
export const MAX_STRESS = 12
export const MAX_HIT_POINTS = 12

/** Começa com 2 Hope; o teto é 6 para todo personagem, em todo nível. */
export const STARTING_HOPE = 2
export const HOPE_MAX = 6

/** "Your character's Armor Score, with all bonuses included, can never exceed 12." */
export const MAX_ARMOR_SCORE = 12
