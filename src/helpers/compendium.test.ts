import { describe, expect, it } from "vitest"

import { FALLBACK_COMPENDIUM } from "@/compendium"

import { resolveCompendium } from "./compendium"

describe("resolveCompendium", () => {
  it("sem nada no banco, tudo vem do JSON", () => {
    const { compendium, origin, rejected } = resolveCompendium(null, FALLBACK_COMPENDIUM)

    expect(compendium).toEqual(FALLBACK_COMPENDIUM)
    expect(Object.values(origin).every((value) => value === "fallback")).toBe(true)
    expect(rejected).toEqual([])
  })

  it("coleção válida do banco substitui a do JSON, e só ela", () => {
    const communities = [{ name: "Underborne", description: "Subníveis.", feature: "Low-Light" }]
    const { compendium, origin } = resolveCompendium({ communities }, FALLBACK_COMPENDIUM)

    expect(compendium.communities).toEqual(communities)
    expect(origin.communities).toBe("remote")
    expect(compendium.classes).toBe(FALLBACK_COMPENDIUM.classes)
    expect(origin.classes).toBe("fallback")
  })

  it("aceita coleção chaveada por nome, como o console do Firebase grava", () => {
    const remote = {
      communities: {
        underborne: { name: "Underborne", description: "Subníveis.", feature: "Low-Light" },
      },
    }

    expect(resolveCompendium(remote, FALLBACK_COMPENDIUM).compendium.communities).toHaveLength(1)
  })

  it("coleção inválida cai no JSON e é listada como recusada", () => {
    const remote = { classes: [{ name: "Sem domínios" }] }
    const { compendium, origin, rejected } = resolveCompendium(remote, FALLBACK_COMPENDIUM)

    expect(compendium.classes).toBe(FALLBACK_COMPENDIUM.classes)
    expect(origin.classes).toBe("fallback")
    expect(rejected).toEqual(["classes"])
  })
})
