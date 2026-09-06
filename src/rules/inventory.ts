import { WEAPONS } from '@/compendium'
import { fail, ok } from '@/helpers'
import type { Character, EquipSlot, InventoryEntry, Result } from '@/types'

/**
 * Regras de equipar, aplicadas na hora e não depois.
 *
 * Uma armadura, uma arma primária, uma secundária. A Iconic Weapon ocupa o
 * slot primário, e o bônus de Bonded só vale enquanto ela for a única arma
 * ativa — divergência deliberada do SRD, dh-sw-v2-spec.md §4.3.
 */

const slotForEntry = (entry: InventoryEntry, requested?: EquipSlot): EquipSlot | null => {
  if (entry.kind === 'armor') {
    return 'armor'
  }

  if (entry.kind !== 'weapon') {
    return null
  }

  if (requested) {
    return requested
  }

  const weapon = WEAPONS.find((candidate) => candidate.name === entry.name)

  return weapon?.burden === 'Secundária' ? 'secondary' : 'primary'
}

export const equip = (
  character: Character,
  entryId: string,
  requestedSlot?: EquipSlot,
): Result<Character> => {
  const entry = character.inventory.find((candidate) => candidate.id === entryId)

  if (!entry) {
    return fail('entry_not_found', entryId)
  }

  const slot = slotForEntry(entry, requestedSlot)

  if (!slot) {
    return fail('entry_not_found', 'Item não é equipável')
  }

  const occupant = character.inventory.find(
    (candidate) => candidate.isEquipped && candidate.slot === slot && candidate.id !== entryId,
  )

  if (occupant) {
    return fail(slot === 'armor' ? 'armor_slot_taken' : 'weapon_slot_taken', occupant.name)
  }

  return ok({
    ...character,
    inventory: character.inventory.map((candidate) =>
      candidate.id === entryId
        ? { ...candidate, isEquipped: true, slot }
        : candidate,
    ),
  })
}

export const unequip = (character: Character, entryId: string): Result<Character> => {
  const entry = character.inventory.find((candidate) => candidate.id === entryId)

  if (!entry) {
    return fail('entry_not_found', entryId)
  }

  return ok({
    ...character,
    inventory: character.inventory.map((candidate) =>
      candidate.id === entryId ? { ...candidate, isEquipped: false, slot: null } : candidate,
    ),
  })
}

/**
 * Bonded só vale se a Iconic Weapon for a única arma ativa.
 * Equipar uma secundária desliga o bônus — custo real, escolha real.
 */
export const hasActiveBonded = (character: Character): boolean => {
  const equippedWeapons = character.inventory.filter(
    (entry) => entry.kind === 'weapon' && entry.isEquipped,
  )

  if (equippedWeapons.length !== 1) {
    return false
  }

  const weapon = WEAPONS.find((candidate) => candidate.name === equippedWeapons[0].name)

  return Boolean(weapon?.isIconic)
}

/** Gastar um consumível. Some do inventário ao chegar a zero. */
export const consume = (character: Character, entryId: string): Result<Character> => {
  const entry = character.inventory.find((candidate) => candidate.id === entryId)

  if (!entry || entry.kind !== 'consumable') {
    return fail('entry_not_found', entryId)
  }

  const remaining = entry.quantity - 1

  return ok({
    ...character,
    inventory:
      remaining > 0
        ? character.inventory.map((candidate) =>
            candidate.id === entryId ? { ...candidate, quantity: remaining } : candidate,
          )
        : character.inventory.filter((candidate) => candidate.id !== entryId),
  })
}
