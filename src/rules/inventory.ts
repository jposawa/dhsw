import { WEAPONS } from "@/compendium"
import { fail, ok } from "@/helpers"
import type { Character, EquipSlot, InventoryEntry, Result } from "@/types"

/**
 * Regras de equipar, aplicadas na hora e não depois.
 *
 * Uma armadura, uma arma primária, uma secundária. Arma de duas mãos ocupa as
 * duas: com ela empunhada não há secundária. Core Rulebook, "Burden" (p. 113).
 */

const TWO_HANDED_BURDEN = "Duas mãos"

const findWeapon = (entry: InventoryEntry | undefined) =>
  entry ? WEAPONS.find((candidate) => candidate.name === entry.name) : undefined

const isTwoHanded = (entry: InventoryEntry | undefined): boolean =>
  findWeapon(entry)?.burden === TWO_HANDED_BURDEN

const equippedIn = (character: Character, slot: EquipSlot) =>
  character.inventory.find((candidate) => candidate.isEquipped && candidate.slot === slot)

/**
 * O slot que as mãos deixam de fora quando `entry` vai para `slot`.
 *
 * Duas mãos na primária tiram a secundária; uma secundária com a primária de
 * duas mãos tira a primária. `null` quando não há conflito.
 */
const handConflictFor = (
  character: Character,
  entry: InventoryEntry,
  slot: EquipSlot,
): InventoryEntry | null => {
  if (slot === "primary" && isTwoHanded(entry)) {
    return equippedIn(character, "secondary") ?? null
  }

  const primary = equippedIn(character, "primary")

  if (slot === "secondary" && primary && primary.id !== entry.id && isTwoHanded(primary)) {
    return primary
  }

  return null
}

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

  return findWeapon(entry)?.burden === "Secundária" ? "secondary" : "primary"
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
    return fail("entryNotEquippable", entry.name)
  }

  const occupant = equippedIn(character, slot)

  if (occupant && occupant.id !== entryId) {
    return fail(slot === "armor" ? "armorSlotTaken" : "weaponSlotTaken", occupant.name)
  }

  const conflict = handConflictFor(character, entry, slot)

  if (conflict) {
    return fail("handsFull", conflict.name)
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
 * Arma de duas mãos também desequipa a secundária, e vice-versa: trocar é
 * "põe esta aqui", e o que as mãos não comportam volta para a mochila.
 *
 * `entryId` nulo esvazia o slot — é o "deixar vazio" da gaveta.
 */
export const equipInSlot = (
  character: Character,
  slot: EquipSlot,
  entryId: string | null,
): Result<Character> => {
  const incoming = character.inventory.find((entry) => entry.id === entryId)

  if (entryId !== null && !incoming) {
    return fail("entryNotFound", entryId)
  }

  // A arma que as mãos não comportam volta para a mochila junto com o ocupante.
  const conflict = incoming ? handConflictFor(character, incoming, slot) : null

  return ok({
    ...character,
    inventory: character.inventory.map((entry) => {
      if (entry.id === entryId) {
        return { ...entry, isEquipped: true, slot }
      }

      // Quem ocupava o slot sai dele, e volta para a mochila em vez de sumir.
      if ((entry.isEquipped && entry.slot === slot) || entry.id === conflict?.id) {
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
