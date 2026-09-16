import { describe, expect, it } from "vitest"

import { FALLBACK_COMPENDIUM } from "@/compendium"

import { resolveCompendium } from "./compendium"

/**
 * O que o Realtime Database faz com um JSON importado: `null` e listas ou
 * objetos vazios somem, e toda lista volta como objeto de chaves "0", "1"…
 */
const asStored = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    const entries = value.map(asStored).map((item, index) => [String(index), item] as const)
    const kept = entries.filter(([, item]) => item !== undefined)

    return kept.length > 0 ? Object.fromEntries(kept) : undefined
  }

  if (value && typeof value === "object") {
    const kept = Object.entries(value)
      .map(([key, item]) => [key, asStored(item)] as const)
      .filter(([, item]) => item !== undefined)

    return kept.length > 0 ? Object.fromEntries(kept) : undefined
  }

  return value === null ? undefined : value
}

describe("compêndio exportado para o Realtime Database", () => {
  it("volta do banco igual ao JSON, sem nenhuma coleção recusada", () => {
    const { compendium, origin, rejected } = resolveCompendium(
      asStored(FALLBACK_COMPENDIUM),
      FALLBACK_COMPENDIUM,
    )

    expect(rejected).toEqual([])
    expect(Object.values(origin).every((value) => value === "remote")).toBe(true)
    expect(compendium).toEqual(FALLBACK_COMPENDIUM)
  })
})
