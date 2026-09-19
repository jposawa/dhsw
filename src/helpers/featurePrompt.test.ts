import { describe, expect, it } from "vitest"

import { TEST_COMPENDIUM } from "@/compendium/testing"
import type { Character, Compendium } from "@/types"

import { createCharacter } from "./character"
import { featureFieldsFor } from "./featurePrompt"
import { singleAncestry } from "./heritage"

const comOrigem = (community: string | null): Character => ({
  ...createCharacter("Rey"),
  heritage: singleAncestry("Human"),
  community,
})

/** Um compêndio cuja origem declara os campos, como o banco vai declarar. */
const comPrompts = (prompts: Compendium["communities"][number]["prompts"]): Compendium => ({
  ...TEST_COMPENDIUM,
  communities: TEST_COMPENDIUM.communities.map((community, index) =>
    index === 0 ? { ...community, prompts } : community,
  ),
})

describe("featureFieldsFor", () => {
  it("ficha cuja espécie e origem não pedem nada não tem campo", () => {
    expect(featureFieldsFor(comOrigem(null), TEST_COMPENDIUM)).toEqual([])
  })

  /* O compêndio manda: declarando `prompts`, sai uma linha por contagem, com
     o rótulo numerado. */
  it("lê do compêndio, uma linha por contagem", () => {
    const origem = TEST_COMPENDIUM.communities[0]
    const feature = /\*\*(.+?)\*\*/.exec(origem.feature)?.[1]?.trim() ?? ""
    const compendium = comPrompts([{ feature, count: 3, label: "Tenet" }])

    const campos = featureFieldsFor(comOrigem(origem.name), compendium)

    expect(campos.map((campo) => campo.label)).toEqual(["Tenet 1", "Tenet 2", "Tenet 3"])
    expect(campos.map((campo) => campo.key)).toEqual([
      `${feature}:0`,
      `${feature}:1`,
      `${feature}:2`,
    ])
  })

  /* A chave é a feature e a linha, nunca a posição: trocar de origem não pode
     empurrar a resposta de uma feature para a que entrou no lugar. */
  it("a chave não depende de que outras features a ficha tem", () => {
    const origem = TEST_COMPENDIUM.communities[0]
    const feature = /\*\*(.+?)\*\*/.exec(origem.feature)?.[1]?.trim() ?? ""
    const compendium = comPrompts([{ feature, count: 1, label: "Tenet" }])

    const sozinha = featureFieldsFor(comOrigem(origem.name), compendium)
    const comEspecie = featureFieldsFor(
      { ...comOrigem(origem.name), heritage: singleAncestry("Twilek") },
      compendium,
    )

    expect(sozinha[0].key).toBe(comEspecie[0].key)
  })
})
