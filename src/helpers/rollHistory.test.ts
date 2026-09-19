import { describe, expect, it } from "vitest"

import type { RollRecord, RollResult } from "@/types"

import { addToHistory, createRollRecord, normalizeRollRecord, overflowingRolls } from "./rollHistory"

const result: RollResult = {
  kind: "dice",
  label: "",
  expression: "1d20",
  dice: [{ sides: 20, value: 12, role: "plain" }],
  modifier: 0,
  total: 12,
  outcome: null,
}

const recordAt = (id: string, createdAt: number): RollRecord => ({
  ...createRollRecord(result),
  id,
  createdAt,
})

describe("createRollRecord", () => {
  it("sem contexto, é rolagem pública sem autor nem ficha", () => {
    const record = createRollRecord(result)

    expect(record.visibility).toBe("public")
    expect(record.author).toBeNull()
    expect(record.sheet).toBeNull()
  })
})

describe("addToHistory", () => {
  it("põe a nova no topo e corta a mais antiga no limite", () => {
    const history = [recordAt("b", 2), recordAt("a", 1)]
    const next = addToHistory(history, recordAt("c", 3), 2)

    expect(next.map((record) => record.id)).toEqual(["c", "b"])
  })
})

describe("overflowingRolls", () => {
  it("devolve as mais antigas além do limite, em qualquer ordem de entrada", () => {
    const rolls = [
      { id: "b", createdAt: 2 },
      { id: "d", createdAt: 4 },
      { id: "a", createdAt: 1 },
      { id: "c", createdAt: 3 },
    ]

    expect(overflowingRolls(rolls, 2).map((roll) => roll.id)).toEqual(["b", "a"])
    expect(overflowingRolls(rolls, 10)).toEqual([])
  })
})

describe("normalizeRollRecord", () => {
  /* O banco apaga null e grava lista como objeto quando tem buraco. */
  it("devolve os null apagados e a lista de dados", () => {
    const stored = {
      kind: "dice",
      expression: "1d20",
      dice: { 0: { sides: 20, value: 12, role: "plain" } },
      total: 12,
      createdAt: 5,
    } as unknown as Partial<RollRecord>

    expect(normalizeRollRecord("chave", stored)).toEqual({
      ...result,
      id: "chave",
      createdAt: 5,
      author: null,
      sheet: null,
      visibility: "public",
    })
  })
})
