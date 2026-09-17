import type { DamageKind, DamageType, Domain, Range, Trait, WeaponBurden } from "@/types"

/**
 * Valores do vocabulario de dominio. As unioes vivem em `types/domain.ts`;
 * aqui so os valores, tipados contra elas — divergencia quebra o build.
 */

export const DOMAIN_LIST: readonly Domain[] = [
  "Aegis",
  "Allure",
  "Edge",
  "Essence",
  "Havoc",
  "Veil",
]

export const TRAIT_LIST: readonly Trait[] = [
  "Agility",
  "Strength",
  "Finesse",
  "Instinct",
  "Presence",
  "Knowledge",
]

export const RANGE_LIST: readonly Range[] = [
  "Melee",
  "Very Close",
  "Close",
  "Far",
  "Very Far",
]

export const DAMAGE_TYPE_LIST: readonly DamageType[] = ["phy", "tech"]

export const DAMAGE_KIND_LIST: readonly DamageKind[] = ["physical", "energy", "thermal"]

/** Rótulo curto de cada tipo granular, como o dano aparece na ficha. */
export const DAMAGE_KIND_LABELS: Readonly<Record<DamageKind, string>> = {
  physical: "físico",
  energy: "energético",
  thermal: "térmico",
}

export const WEAPON_BURDEN_LIST: readonly WeaponBurden[] = [
  "Uma mão",
  "Duas mãos",
  "Secundária",
]

/**
 * Os verbos de cada atributo, como a ficha do livro os imprime. São exemplo,
 * não limite — servem para achar o atributo de uma ação no meio da cena.
 * Core Rulebook, "Step 3" (p. 17).
 */
export const TRAIT_VERBS: Readonly<Record<Trait, readonly string[]>> = {
  Agility: ["Sprint", "Leap", "Maneuver"],
  Strength: ["Lift", "Smash", "Grapple"],
  Finesse: ["Control", "Hide", "Tinker"],
  Instinct: ["Perceive", "Sense", "Navigate"],
  Presence: ["Charm", "Perform", "Deceive"],
  Knowledge: ["Recall", "Analyze", "Comprehend"],
}
