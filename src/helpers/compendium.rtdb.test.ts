import { describe, expect, it } from "vitest"

import { LOCAL_COMPENDIUM, TEST_COMPENDIUM } from "@/compendium/testing"
import type { Compendium } from "@/types"

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

const expectRoundTrip = (source: Compendium) => {
  const { compendium, missing, rejected } = resolveCompendium(asStored(source))

  expect(rejected).toEqual([])
  expect(missing).toEqual([])
  expect(compendium).toEqual(source)
}

describe("compêndio exportado para o Realtime Database", () => {
  /* O compêndio de teste tem `null` e lista vazia de propósito. */
  it("o de teste volta do banco igual", () => {
    expectRoundTrip(TEST_COMPENDIUM)
  })

  it.skipIf(LOCAL_COMPENDIUM === null)("o real volta do banco igual", () => {
    expectRoundTrip(LOCAL_COMPENDIUM as Compendium)
  })
})
