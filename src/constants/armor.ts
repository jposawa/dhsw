import type { ArmorLineName, EquipSlot, Tier } from "@/types"

/**
 * Armadura, sem armadura e Bare Bones. Só valores — a conta vive em `rules/`.
 *
 * Fonte: Daggerheart Core Rulebook, "Using Armor" e "Unarmored" (p. 114),
 * "Armor Tables" (p. 126–127) e a carta Bare Bones, do domínio Valor — no
 * DH-SW ela está em Aegis.
 */

/**
 * O traço de cada linha. É o `Flexible`, `Heavy` e `Very Heavy` das armaduras
 * base do livro; a linha sem traço é a do Leather Armor.
 */
export const ARMOR_LINE_MODIFIERS: Readonly<
  Record<ArmorLineName, { evasion: number; agility: number }>
> = {
  Flexible: { evasion: 1, agility: 0 },
  Neutra: { evasion: 0, agility: 0 },
  Heavy: { evasion: -1, agility: 0 },
  "Very Heavy": { evasion: -2, agility: -1 },
}

/**
 * Sem armadura: Armor Score 0, Major igual ao nível e Severe igual ao dobro
 * do nível. Sem bônus e sem penalidade.
 */
export const UNARMORED = {
  armorScore: 0,
  majorLevelMultiplier: 1,
  severeLevelMultiplier: 2,
} as const

/**
 * A carta Bare Bones. Só vale **com a carta no Loadout** e sem armadura:
 * Armor Score base 3 + Strength e thresholds base por tier, somados ao nível
 * como os de qualquer armadura.
 */
export const BARE_BONES = {
  cardName: "Bare Bones",
  armorScoreBase: 3,
  thresholdsByTier: {
    1: { majorBase: 9, severeBase: 19 },
    2: { majorBase: 11, severeBase: 24 },
    3: { majorBase: 13, severeBase: 31 },
    4: { majorBase: 15, severeBase: 38 },
  } satisfies Record<Tier, { majorBase: number; severeBase: number }>,
} as const

/**
 * Os três slots de equipamento, na ordem em que a ficha os mostra.
 *
 * Armadura primeiro porque é a única que muda número derivado — Armor Score e
 * os dois limiares saem dela. As armas mudam a rolagem, não a ficha.
 */
export const EQUIP_SLOTS: readonly { id: EquipSlot; label: string }[] = [
  { id: "armor", label: "Armadura" },
  { id: "primary", label: "Primária" },
  { id: "secondary", label: "Secundária" },
]
