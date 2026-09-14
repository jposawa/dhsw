import { CUSTOMIZABLE_EXTRA_SLOTS } from "@/constants"
import { fail, ok } from "@/helpers"
import type { Augment, Character, Compendium, HouseRules, InventoryEntry, Result, Tier, Weapon } from "@/types"

/**
 * Armas customizáveis — regra da casa, adaptada dos augments do Ikonis
 * (Core Rulebook, campanha Motherboard, p. 300).
 *
 * A arma diz quantos cabem: `Customizable (n)` dá n + 1 slots, e arma sem a
 * propriedade não aceita augment. Cada augment exige um Tier mínimo do
 * personagem e, instalado, vale como feature a mais daquela arma. Por
 * instância: dois blasters iguais podem ter augments diferentes.
 */

/** Slots de augment da arma. Zero quando ela não é Customizable. */
export const augmentSlotsFor = (weapon: Weapon | undefined): number => {
  if (weapon?.customizable === null || weapon?.customizable === undefined) {
    return 0
  }

  return weapon.customizable + CUSTOMIZABLE_EXTRA_SLOTS
}

/** Os augments instalados numa linha do inventário, na ordem em que entraram. */
export const augmentsOf = (entry: InventoryEntry, compendium: Compendium): readonly Augment[] =>
  entry.installedModules
    .map((name) => compendium.augments.find((augment) => augment.name === name))
    .filter((augment): augment is Augment => augment !== undefined)

/** O que os augments somam na rolagem da arma. Zero com a regra desligada. */
export const augmentRollBonuses = (
  entry: InventoryEntry,
  houseRules: HouseRules,
  compendium: Compendium,
): { damageBonus: number; attackBonus: number } => {
  if (!houseRules.hasCustomWeapons) {
    return { damageBonus: 0, attackBonus: 0 }
  }

  return augmentsOf(entry, compendium).reduce(
    (bonuses, augment) => ({
      damageBonus: bonuses.damageBonus + (augment.damageBonus ?? 0),
      attackBonus: bonuses.attackBonus + (augment.attackBonus ?? 0),
    }),
    { damageBonus: 0, attackBonus: 0 },
  )
}

const replaceEntry = (character: Character, next: InventoryEntry): Character => ({
  ...character,
  inventory: character.inventory.map((entry) => (entry.id === next.id ? next : entry)),
})

export const installAugment = (
  character: Character,
  entryId: string,
  augmentName: string,
  tier: Tier,
  houseRules: HouseRules,
  compendium: Compendium,
): Result<Character> => {
  if (!houseRules.hasCustomWeapons) {
    return fail("customWeaponsOff")
  }

  const entry = character.inventory.find((candidate) => candidate.id === entryId)

  if (!entry || entry.kind !== "weapon") {
    return fail("entryNotFound", entryId)
  }

  const weapon = compendium.weapons.find((candidate) => candidate.name === entry.name)
  const slots = augmentSlotsFor(weapon)

  if (slots === 0) {
    return fail("weaponNotCustomizable", entry.name)
  }

  const augment = compendium.augments.find((candidate) => candidate.name === augmentName)

  if (!augment) {
    return fail("augmentUnknown", augmentName)
  }

  if (augment.tier > tier) {
    return fail("augmentTierTooHigh", `Tier ${augment.tier}`)
  }

  if (entry.installedModules.includes(augmentName)) {
    return fail("augmentAlreadyInstalled", augmentName)
  }

  if (entry.installedModules.length >= slots) {
    return fail("augmentSlotsFull")
  }

  return ok(replaceEntry(character, { ...entry, installedModules: [...entry.installedModules, augmentName] }))
}

/** Tirar um augment é sempre livre: ele continua existindo, só sai do slot. */
export const removeAugment = (
  character: Character,
  entryId: string,
  augmentName: string,
): Result<Character> => {
  const entry = character.inventory.find((candidate) => candidate.id === entryId)

  if (!entry || !entry.installedModules.includes(augmentName)) {
    return fail("augmentUnknown", augmentName)
  }

  return ok(
    replaceEntry(character, {
      ...entry,
      installedModules: entry.installedModules.filter((name) => name !== augmentName),
    }),
  )
}
