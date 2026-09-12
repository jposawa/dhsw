import { describe, expect, it } from "vitest"

import { createCharacter, createInventoryEntry } from "@/helpers"
import type { Character, InventoryEntry } from "@/types"

import { addEntry, equip, removeEntry, setQuantity, unequip } from "./inventory"

const withInventory = (entries: InventoryEntry[]): Character => ({
  ...createCharacter("Rey"),
  inventory: entries,
})

const unwrap = (result: ReturnType<typeof addEntry>): Character => {
  if (!result.ok) {
    throw new Error(`esperado ok, veio ${result.code}`)
  }

  return result.value
}

describe("addEntry", () => {
  it("empilha consumivel de mesmo nome em vez de criar outra linha", () => {
    const character = withInventory([createInventoryEntry("consumable", "Medpac")])

    const next = unwrap(addEntry(character, createInventoryEntry("consumable", "Medpac")))

    expect(next.inventory).toHaveLength(1)
    expect(next.inventory[0].quantity).toBe(2)
  })

  /* Cada arma carrega os próprios módulos: o sabre com Kyber Bleed não é o
     mesmo objeto que o sabre sem, e empilhar perderia a diferença. */
  it("nao empilha arma, porque cada instancia tem os proprios modulos", () => {
    const character = withInventory([createInventoryEntry("weapon", "Vibroblade")])

    const next = unwrap(addEntry(character, createInventoryEntry("weapon", "Vibroblade")))

    expect(next.inventory).toHaveLength(2)
  })
})

describe("removeEntry", () => {
  it("tira a linha inteira", () => {
    const entry = createInventoryEntry("item", "Corda")
    const next = unwrap(removeEntry(withInventory([entry]), entry.id))

    expect(next.inventory).toHaveLength(0)
  })

  it("recusa id que nao existe, sem lancar", () => {
    const result = removeEntry(withInventory([]), "nao-existe")

    expect(result.ok).toBe(false)
    expect(result.ok === false && result.code).toBe("entryNotFound")
  })
})

describe("setQuantity", () => {
  it("muda a quantidade", () => {
    const entry = createInventoryEntry("consumable", "Medpac")
    const next = unwrap(setQuantity(withInventory([entry]), entry.id, 5))

    expect(next.inventory[0].quantity).toBe(5)
  })

  it("zero remove a linha — item com quantidade 0 nao existe", () => {
    const entry = createInventoryEntry("consumable", "Medpac")
    const next = unwrap(setQuantity(withInventory([entry]), entry.id, 0))

    expect(next.inventory).toHaveLength(0)
  })
})

describe("equip", () => {
  it("recusa a segunda armadura, e devolve o nome da que ja esta vestida", () => {
    const worn = { ...createInventoryEntry("armor", "Trooper Plate"), isEquipped: true, slot: "armor" as const }
    const other = createInventoryEntry("armor", "Scout Mesh")

    const result = equip(withInventory([worn, other]), other.id)

    expect(result.ok).toBe(false)
    expect(result.ok === false && result.code).toBe("armorSlotTaken")
    expect(result.ok === false && result.detail).toBe("Trooper Plate")
  })

  it("desequipar libera o slot para a proxima", () => {
    const worn = { ...createInventoryEntry("armor", "Trooper Plate"), isEquipped: true, slot: "armor" as const }
    const other = createInventoryEntry("armor", "Scout Mesh")
    const character = withInventory([worn, other])

    const freed = unwrap(unequip(character, worn.id))
    const next = unwrap(equip(freed, other.id))

    expect(next.inventory.find((entry) => entry.id === other.id)?.isEquipped).toBe(true)
  })
})
