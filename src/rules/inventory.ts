import { WEAPONS } from "@/compendium"
import { fail, ok } from "@/helpers"
import type { Character, EquipSlot, InventoryEntry, Result } from "@/types"

/**
 * Regras de equipar, aplicadas na hora e não depois.
 *
 * Uma armadura, uma arma primária, uma secundária. A Iconic Weapon ocupa o
 * slot primário, e o bônus de Bonded só vale enquanto ela for a única arma
 * ativa — divergência deliberada do SRD, dh-sw-v2-spec.md §4.3.
 */

const slotForEntry = (entry: InventoryEntry, requested?: EquipSlot): EquipSlot | null => {
  if (entry.kind === "armor") {
    return "armor"
  }

  if (entry.kind !== "weapon") {
    return null
  }

  if (requested) {
    return requested
  }

  const weapon = WEAPONS.find((candidate) => candidate.name === entry.name)

  return weapon?.burden === "Secundária" ? "secondary" : "primary"
}

export const equip = (
  character: Character,
  entryId: string,
  requestedSlot?: EquipSlot,
): Result<Character> => {
  const entry = character.inventory.find((candidate) => candidate.id === entryId)

  if (!entry) {
    return fail("entryNotFound", entryId)
  }

  const slot = slotForEntry(entry, requestedSlot)

  if (!slot) {
    return fail("entryNotFound", "Item não é equipável")
  }

  const occupant = character.inventory.find(
    (candidate) => candidate.isEquipped && candidate.slot === slot && candidate.id !== entryId,
  )

  if (occupant) {
    return fail(slot === "armor" ? "armorSlotTaken" : "weaponSlotTaken", occupant.name)
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
    return fail("entryNotFound", entryId)
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
    (entry) => entry.kind === "weapon" && entry.isEquipped,
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

  if (!entry || entry.kind !== "consumable") {
    return fail("entryNotFound", entryId)
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

/**
 * Pôr uma linha no inventário.
 *
 * Consumível empilha: duas Medpacs viram quantidade 2, não duas linhas. Arma e
 * armadura **não** empilham — cada instância carrega os próprios módulos, e o
 * sabre com Kyber Bleed não é o mesmo objeto que o sabre sem.
 */
export const addEntry = (
  character: Character,
  entry: InventoryEntry,
): Result<Character> => {
  const stackable = entry.kind === "consumable" || entry.kind === "item"

  const existing = stackable
    ? character.inventory.find(
        (candidate) => candidate.kind === entry.kind && candidate.name === entry.name,
      )
    : undefined

  if (existing) {
    return ok({
      ...character,
      inventory: character.inventory.map((candidate) =>
        candidate.id === existing.id
          ? { ...candidate, quantity: candidate.quantity + entry.quantity }
          : candidate,
      ),
    })
  }

  return ok({ ...character, inventory: [...character.inventory, entry] })
}

/** Tirar uma linha do inventário. Some inteira, com a quantidade que tiver. */
export const removeEntry = (character: Character, entryId: string): Result<Character> => {
  if (!character.inventory.some((candidate) => candidate.id === entryId)) {
    return fail("entryNotFound", entryId)
  }

  return ok({
    ...character,
    inventory: character.inventory.filter((candidate) => candidate.id !== entryId),
  })
}

/** Mudar a quantidade. Zero remove a linha — item com quantidade 0 não existe. */
export const setQuantity = (
  character: Character,
  entryId: string,
  quantity: number,
): Result<Character> => {
  if (!character.inventory.some((candidate) => candidate.id === entryId)) {
    return fail("entryNotFound", entryId)
  }

  if (quantity < 1) {
    return removeEntry(character, entryId)
  }

  return ok({
    ...character,
    inventory: character.inventory.map((candidate) =>
      candidate.id === entryId ? { ...candidate, quantity } : candidate,
    ),
  })
}

/**
 * Pôr uma linha num slot, **trocando** com quem estiver lá.
 *
 * `equip` recusa o slot ocupado, e isso está certo para o caminho em que a
 * pessoa mandou equipar uma arma qualquer: a recusa é a informação. Mas trocar
 * de arma no meio de uma cena é o gesto normal da mesa, e obrigar a desequipar
 * antes é um passo a mais num momento em que ninguém tem paciência.
 *
 * Os dois existem porque respondem a perguntas diferentes: `equip` é "cabe?",
 * este é "põe esta aqui". Quem chama escolhe, e nenhuma das duas deduz a
 * intenção da outra.
 *
 * `entryId` nulo esvazia o slot — é o "deixar vazio" da gaveta.
 */
export const equipInSlot = (
  character: Character,
  slot: EquipSlot,
  entryId: string | null,
): Result<Character> => {
  if (entryId !== null && !character.inventory.some((entry) => entry.id === entryId)) {
    return fail("entryNotFound", entryId)
  }

  return ok({
    ...character,
    inventory: character.inventory.map((entry) => {
      if (entry.id === entryId) {
        return { ...entry, isEquipped: true, slot }
      }

      // Quem ocupava o slot sai dele, e volta para a mochila em vez de sumir.
      if (entry.isEquipped && entry.slot === slot) {
        return { ...entry, isEquipped: false, slot: null }
      }

      return entry
    }),
  })
}

/** O que pode ocupar cada slot. A gaveta de troca lista exatamente isto. */
export const candidatesForSlot = (
  character: Character,
  slot: EquipSlot,
): readonly InventoryEntry[] => {
  if (slot === "armor") {
    return character.inventory.filter((entry) => entry.kind === "armor")
  }

  return character.inventory.filter((entry) => entry.kind === "weapon")
}
