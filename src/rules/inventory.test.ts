import { describe, expect, it } from "vitest"

import { createCharacter, createInventoryEntry } from "@/helpers"
import type { Character, InventoryEntry } from "@/types"

import {
  addEntry,
  candidatesForSlot,
  equip,
  equipInSlot,
  removeEntry,
  setQuantity,
  unequip,
} from "./inventory"

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

describe("equipInSlot", () => {
  const worn = {
    ...createInventoryEntry("armor", "Trooper Plate"),
    isEquipped: true,
    slot: "armor" as const,
  }

  /* Trocar de arma no meio de uma cena é o gesto normal da mesa: obrigar a
     desequipar antes seria um passo a mais num momento sem paciência. */
  it("troca com quem estava no slot, em uma operacao", () => {
    const other = createInventoryEntry("armor", "Scout Mesh")
    const next = unwrap(equipInSlot(withInventory([worn, other]), "armor", other.id))

    expect(next.inventory.find((entry) => entry.id === other.id)?.isEquipped).toBe(true)
    expect(next.inventory.find((entry) => entry.id === worn.id)?.isEquipped).toBe(false)
  })

  it("quem sai volta para a mochila em vez de sumir", () => {
    const other = createInventoryEntry("armor", "Scout Mesh")
    const next = unwrap(equipInSlot(withInventory([worn, other]), "armor", other.id))

    expect(next.inventory).toHaveLength(2)
    expect(next.inventory.find((entry) => entry.id === worn.id)?.slot).toBeNull()
  })

  it("id nulo esvazia o slot", () => {
    const next = unwrap(equipInSlot(withInventory([worn]), "armor", null))

    expect(next.inventory[0].isEquipped).toBe(false)
  })

  it("recusa id que nao esta no inventario", () => {
    expect(equipInSlot(withInventory([worn]), "armor", "nao-existe").ok).toBe(false)
  })

  it("nao mexe nos outros slots", () => {
    const blaster = {
      ...createInventoryEntry("weapon", "Blaster"),
      isEquipped: true,
      slot: "primary" as const,
    }
    const other = createInventoryEntry("armor", "Scout Mesh")

    const next = unwrap(equipInSlot(withInventory([worn, blaster, other]), "armor", other.id))

    expect(next.inventory.find((entry) => entry.id === blaster.id)?.isEquipped).toBe(true)
  })
})

describe("candidatesForSlot", () => {
  it("armadura so lista armadura; arma so lista arma", () => {
    const character = withInventory([
      createInventoryEntry("armor", "Trooper Plate"),
      createInventoryEntry("weapon", "Blaster"),
      createInventoryEntry("item", "Corda"),
    ])

    expect(candidatesForSlot(character, "armor").map((entry) => entry.name)).toEqual([
      "Trooper Plate",
    ])
    expect(candidatesForSlot(character, "primary").map((entry) => entry.name)).toEqual([
      "Blaster",
    ])
  })
})

describe("burden — arma de duas maos ocupa as duas (p. 113)", () => {
  const equipped = (name: string, slot: "primary" | "secondary") => ({
    ...createInventoryEntry("weapon", name),
    isEquipped: true,
    slot,
  })

  it("equip recusa secundaria com uma primaria de duas maos", () => {
    const rifle = equipped("Blaster Rifle", "primary")
    const knife = createInventoryEntry("weapon", "Vibroknife")
    const result = equip(withInventory([rifle, knife]), knife.id, "secondary")

    expect(result.ok).toBe(false)
    expect(result.ok ? null : result.code).toBe("handsFull")
  })

  it("equipInSlot com duas maos na primaria manda a secundaria para a mochila", () => {
    const knife = equipped("Vibroknife", "secondary")
    const rifle = createInventoryEntry("weapon", "Blaster Rifle")
    const next = unwrap(equipInSlot(withInventory([knife, rifle]), "primary", rifle.id))

    expect(next.inventory.find((entry) => entry.id === rifle.id)?.slot).toBe("primary")
    expect(next.inventory.find((entry) => entry.id === knife.id)?.isEquipped).toBe(false)
  })

  it("equipInSlot de secundaria tira a primaria de duas maos", () => {
    const rifle = equipped("Blaster Rifle", "primary")
    const knife = createInventoryEntry("weapon", "Vibroknife")
    const next = unwrap(equipInSlot(withInventory([rifle, knife]), "secondary", knife.id))

    expect(next.inventory.find((entry) => entry.id === rifle.id)?.isEquipped).toBe(false)
  })

  it("uma mao na primaria convive com a secundaria", () => {
    const pistol = equipped("Blaster Pistol", "primary")
    const knife = createInventoryEntry("weapon", "Vibroknife")

    expect(equip(withInventory([pistol, knife]), knife.id, "secondary").ok).toBe(true)
  })
})
