import { describe, expect, it } from "vitest"

import { EMPTY_COMPENDIUM } from "@/compendium"

import { resolveCompendium } from "./compendium"

const underborne = { name: "Underborne", description: "Subníveis.", feature: "Low-Light" }

describe("resolveCompendium", () => {
  it("sem nada no banco, o compêndio fica vazio e tudo é listado como ausente", () => {
    const { compendium, missing, rejected } = resolveCompendium(null)

    expect(compendium).toEqual(EMPTY_COMPENDIUM)
    expect(missing).toContain("skills")
    expect(rejected).toEqual([])
  })

  it("coleção do banco entra, e as outras ficam vazias", () => {
    const { compendium, missing } = resolveCompendium({ communities: [underborne] })

    expect(compendium.communities).toEqual([underborne])
    expect(compendium.classes).toEqual([])
    expect(missing).not.toContain("communities")
    expect(missing).toContain("classes")
  })

  it("aceita coleção chaveada por nome, como o console do Firebase grava", () => {
    const remote = { communities: { underborne } }

    expect(resolveCompendium(remote).compendium.communities).toHaveLength(1)
  })

  it("registro sem nome recusa a coleção inteira", () => {
    const remote = { communities: [underborne, { description: "Sem nome." }] }
    const { compendium, rejected } = resolveCompendium(remote)

    expect(compendium.communities).toEqual([])
    expect(rejected).toEqual(["communities"])
  })

  it("coleção que não é lista de registros é recusada", () => {
    expect(resolveCompendium({ classes: "quebrado" }).rejected).toEqual(["classes"])
  })
})
