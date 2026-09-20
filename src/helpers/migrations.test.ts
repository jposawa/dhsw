import { describe, expect, it } from "vitest"

import { CHARACTER_SCHEMA_VERSION, DEFAULT_HOUSE_RULES } from "@/constants"
import type { Character, RosterState } from "@/types"

import {
  houseRulesV1ToV2,
  rosterV1ToV2,
  rosterV2ToV3,
  rosterV3ToV4,
  rosterV4ToV5,
  rosterV5ToV6,
  rosterV6ToV7,
  rosterV7ToV8,
  rosterV8ToV9,
  rosterV9ToV10,
  rosterV10ToV11,
} from "./migrations"

/**
 * Fixture do formato v1: ficha **sem** `partyId` e com `schema: 1`. Escrita à
 * mão de propósito — usar `createCharacter` aqui testaria o formato de hoje,
 * não o que está gravado no aparelho de alguém.
 */
const V1_ROSTER = {
  characters: {
    "sheet-1": {
      id: "sheet-1",
      schema: 1,
      name: "Kael",
      createdAt: 1_700_000_000_000,
      updatedAt: 1_700_000_000_000,
      ancestry: "Human",
      community: null,
      className: "Soldier",
      subclass: null,
      level: 3,
      traits: {
        Agility: 1,
        Strength: 2,
        Finesse: 0,
        Instinct: 0,
        Presence: -1,
        Knowledge: 0,
      },
      marks: { hp: 1, stress: 2, armor: 0, hope: 3 },
      loadout: ["Bare Bones"],
      vault: [],
      inventory: [],
      advancements: [],
      experiences: [],
      notes: "",
    },
  },
  order: ["sheet-1"],
}

describe("rosterV1ToV2", () => {
  it("acrescenta partyId nulo", () => {
    const migrated = rosterV1ToV2(V1_ROSTER)

    expect(migrated.characters["sheet-1"].partyId).toBeNull()
  })

  it("sobe o schema da ficha junto, nao so o do pacote", () => {
    const migrated = rosterV1ToV2(V1_ROSTER)

    expect(migrated.characters["sheet-1"].schema).toBe(2)
  })

  it("preserva o resto da ficha intacto", () => {
    const migrated = rosterV1ToV2(V1_ROSTER)
    const character = migrated.characters["sheet-1"]

    expect(character.name).toBe("Kael")
    expect(character.level).toBe(3)
    expect(character.marks).toEqual({ hp: 1, stress: 2, armor: 0, hope: 3 })
    expect(character.loadout).toEqual(["Bare Bones"])
    expect(character.traits.Strength).toBe(2)
  })

  it("preserva a ordem", () => {
    expect(rosterV1ToV2(V1_ROSTER).order).toEqual(["sheet-1"])
  })

  it("nao apaga partyId de quem ja tem", () => {
    const withParty = {
      ...V1_ROSTER,
      characters: {
        "sheet-1": { ...V1_ROSTER.characters["sheet-1"], partyId: "party-9" },
      },
    }

    expect(rosterV1ToV2(withParty).characters["sheet-1"].partyId).toBe("party-9")
  })

  it("aguenta pacote vazio ou corrompido sem explodir", () => {
    // O `localStorage` pode ter qualquer coisa: outra aba, versao antiga,
    // edicao manual. Migracao que lanca aqui derruba o app no boot.
    expect(rosterV1ToV2(null)).toEqual({ characters: {}, order: [] })
    expect(rosterV1ToV2({})).toEqual({ characters: {}, order: [] })
  })
})

describe("formato v2 atual", () => {
  it("a ficha migrada tem a mesma forma que uma nova", () => {
    const migrated = rosterV1ToV2(V1_ROSTER).characters["sheet-1"] as Character
    const roster: RosterState = { characters: { "sheet-1": migrated }, order: ["sheet-1"] }

    // Rodar de novo nao pode mudar mais nada: a migracao e idempotente.
    expect(rosterV1ToV2(roster)).toEqual(roster)
  })
})

describe("houseRulesV1ToV2", () => {
  it("mantém o que a mesa escolheu e liga as regras novas desligadas", () => {
    const migrated = houseRulesV1ToV2({ hasTwoCardsPerLevel: true, loadoutSize: "4+tier" })

    expect(migrated.hasTwoCardsPerLevel).toBe(true)
    expect(migrated.loadoutSize).toBe("4+tier")
    expect(migrated.hasCustomWeapons).toBe(false)
  })
})

describe("rosterV2ToV3", () => {
  const v2 = rosterV1ToV2(V1_ROSTER)

  it("acrescenta tokens vazio e sobe o schema para 3", () => {
    const character = rosterV2ToV3(v2).characters["sheet-1"]

    expect(character.tokens).toEqual([])
    expect(character.schema).toBe(3)
  })

  it("preserva o resto da ficha", () => {
    const character = rosterV2ToV3(v2).characters["sheet-1"]

    expect(character.marks).toEqual({ hp: 1, stress: 2, armor: 0, hope: 3 })
    expect(character.partyId).toBeNull()
  })
})

describe("rosterV3ToV4", () => {
  const v3 = rosterV2ToV3(rosterV1ToV2(V1_ROSTER))
  const deviceRules = { ...DEFAULT_HOUSE_RULES, hasTwoCardsPerLevel: true }

  /* Até aqui a ficha calculava com as regras do aparelho: elas viram as dela,
     e nenhum número muda sozinho na atualização. */
  it("dá à ficha as regras que valiam no aparelho e sobe o schema para 4", () => {
    const character = rosterV3ToV4(v3, deviceRules).characters["sheet-1"]

    expect(character.houseRules).toEqual(deviceRules)
    expect(character.schema).toBe(4)
  })
})

describe("rosterV4ToV5", () => {
  const v4 = rosterV3ToV4(rosterV2ToV3(rosterV1ToV2(V1_ROSTER)), DEFAULT_HOUSE_RULES)

  /* Ficha antiga tem espécie única: as duas features vêm dela. */
  it("acrescenta a espécie mista vazia e sobe o schema para 5", () => {
    const character = rosterV4ToV5(v4).characters["sheet-1"] as unknown as {
      ancestry: string | null
      mixedAncestry: string | null
      schema: number
    }

    expect(character.mixedAncestry).toBeNull()
    expect(character.ancestry).toBe("Human")
    expect(character.schema).toBe(5)
  })
})

describe("rosterV5ToV6", () => {
  const v5 = rosterV4ToV5(rosterV3ToV4(rosterV2ToV3(rosterV1ToV2(V1_ROSTER)), DEFAULT_HOUSE_RULES))
  const heritageOf = (roster: RosterState) => roster.characters["sheet-1"].heritage

  it("espécie única vira o código da ascendência, sem nome nem escolhas", () => {
    expect(heritageOf(rosterV5ToV6(v5))).toEqual({
      ancestry: "Human",
      label: null,
      firstAncestry: null,
      secondAncestry: null,
    })
    expect(rosterV5ToV6(v5).characters["sheet-1"].schema).toBe(6)
  })

  /* Na v5 a espécie mista era um campo solto ao lado da espécie: a primeira
     feature vinha da espécie e a segunda do campo solto. */
  it("mista guarda o código da mista e a espécie de cada feature", () => {
    const stored = v5.characters["sheet-1"] as unknown as Record<string, unknown>
    const mixed: RosterState = {
      ...v5,
      characters: { "sheet-1": { ...stored, mixedAncestry: "Twilek" } as unknown as Character },
    }

    expect(heritageOf(rosterV5ToV6(mixed))).toEqual({
      ancestry: "mixed",
      label: null,
      firstAncestry: "Human",
      secondAncestry: "Twilek",
    })
  })
})

describe("rosterV8ToV9", () => {
  const v8 = rosterV7ToV8(
    rosterV6ToV7(
      rosterV5ToV6(
        rosterV4ToV5(rosterV3ToV4(rosterV2ToV3(rosterV1ToV2(V1_ROSTER)), DEFAULT_HOUSE_RULES)),
      ),
    ),
  )

  const comAvanco = (advancement: Record<string, unknown>): RosterState => ({
    ...v8,
    characters: {
      "sheet-1": { ...v8.characters["sheet-1"], advancements: [advancement] } as unknown as Character,
    },
  })

  /* O avanço guardado só dizia o tipo; quem sabia o que ele somava era a
     matemática. Agora ele diz, e o número tem que sair igual. */
  it("o avanço passa a carregar o que move", () => {
    const roster = comAvanco({ level: 2, kind: "hp", detail: "", slotsSpent: 1 })
    const [avanco] = rosterV8ToV9(roster).characters["sheet-1"].advancements

    expect(avanco.changes).toEqual([{ target: "hitPointsMax", value: 1 }])
  })

  it("o de atributo lê a escolha que estava no detalhe", () => {
    const roster = comAvanco({ level: 3, kind: "trait", detail: "Agility", slotsSpent: 1 })
    const [avanco] = rosterV8ToV9(roster).characters["sheet-1"].advancements

    expect(avanco.changes).toEqual([{ target: "trait.Agility", value: 1 }])
  })

  /* Multiclasse não move número: o que ela muda é o que a ficha alcança. */
  it("avanço sem número atravessa com lista vazia", () => {
    const roster = comAvanco({ level: 5, kind: "multiclass", detail: "Veil", slotsSpent: 2 })
    const [avanco] = rosterV8ToV9(roster).characters["sheet-1"].advancements

    expect(avanco.changes).toEqual([])
    expect(avanco.detail).toBe("Veil")
  })

  it("ficha sem avanço nenhum atravessa", () => {
    const migrada = rosterV8ToV9(v8).characters["sheet-1"]

    expect(migrada.advancements).toEqual([])
    expect(migrada.schema).toBe(9)
  })
})

describe("rosterV9ToV10", () => {
  const v9 = rosterV8ToV9(
    rosterV7ToV8(
      rosterV6ToV7(
        rosterV5ToV6(
          rosterV4ToV5(rosterV3ToV4(rosterV2ToV3(rosterV1ToV2(V1_ROSTER)), DEFAULT_HOUSE_RULES)),
        ),
      ),
    ),
  )

  it("ficha antiga entra sem resposta nenhuma", () => {
    const migrada = rosterV9ToV10(v9).characters["sheet-1"]

    expect(migrada.featureNotes).toEqual({})
    expect(migrada.schema).toBe(10)
  })
})

describe("rosterV10ToV11", () => {
  const v10 = rosterV9ToV10(
    rosterV8ToV9(
      rosterV7ToV8(
        rosterV6ToV7(
          rosterV5ToV6(
            rosterV4ToV5(rosterV3ToV4(rosterV2ToV3(rosterV1ToV2(V1_ROSTER)), DEFAULT_HOUSE_RULES)),
          ),
        ),
      ),
    ),
  )

  /* `null` é o array do livro: ficha antiga não tinha array sorteado, e os
     atributos dela continuam onde estavam. */
  it("ficha antiga fica com o array do livro, e os atributos intactos", () => {
    const antes = v10.characters["sheet-1"].traits
    const migrada = rosterV10ToV11(v10).characters["sheet-1"]

    expect(migrada.traitArray).toBeNull()
    expect(migrada.traits).toEqual(antes)
    expect(migrada.schema).toBe(CHARACTER_SCHEMA_VERSION)
  })

  it("array sorteado atravessa", () => {
    const sorteado: RosterState = {
      ...v10,
      characters: {
        "sheet-1": { ...v10.characters["sheet-1"], traitArray: [2, 2, 1, 0, 0, -1] } as Character,
      },
    }

    expect(rosterV10ToV11(sorteado).characters["sheet-1"].traitArray).toEqual([2, 2, 1, 0, 0, -1])
  })
})

describe("rosterV7ToV8", () => {
  const v7 = rosterV6ToV7(
    rosterV5ToV6(
      rosterV4ToV5(rosterV3ToV4(rosterV2ToV3(rosterV1ToV2(V1_ROSTER)), DEFAULT_HOUSE_RULES)),
    ),
  )

  it("ficha antiga entra sem imagem, e na versão de hoje", () => {
    const migrada = rosterV7ToV8(v7).characters["sheet-1"]

    expect(migrada.avatarUrl).toBeNull()
    expect(migrada.schema).toBe(8)
  })

  /* Quem já tem imagem não a perde ao migrar. */
  it("imagem existente atravessa", () => {
    const comImagem: RosterState = {
      ...v7,
      characters: {
        "sheet-1": { ...v7.characters["sheet-1"], avatarUrl: "https://exemplo.com/kar.png" },
      },
    }

    expect(rosterV7ToV8(comImagem).characters["sheet-1"].avatarUrl).toBe(
      "https://exemplo.com/kar.png",
    )
  })
})

describe("rosterV6ToV7", () => {
  const v5 = rosterV4ToV5(rosterV3ToV4(rosterV2ToV3(rosterV1ToV2(V1_ROSTER)), DEFAULT_HOUSE_RULES))
  const v6 = rosterV5ToV6(v5)
  const heritageOf = (roster: RosterState) => roster.characters["sheet-1"].heritage

  const asMixedV6 = (heritage: Record<string, unknown>): RosterState => ({
    ...v6,
    characters: {
      "sheet-1": { ...v6.characters["sheet-1"], heritage } as unknown as Character,
    },
  })

  /* O ponto da v7: as duas fontes valem para toda ascendência. Na única elas
     apontam para a própria espécie, e quem lê para de perguntar se é mista. */
  it("espécie única aponta as duas fontes para ela mesma", () => {
    expect(heritageOf(rosterV6ToV7(v6))).toEqual({
      name: "Human",
      sources: { first: "Human", second: "Human" },
      isMixed: false,
    })
    expect(rosterV6ToV7(v6).characters["sheet-1"].schema).toBe(7)
  })

  /* O código `"mixed"` sai do campo do nome e vira `isMixed`; o nome passa a
     ser o que a mesa deu, que na v6 morava em `label`. */
  it("mista troca o código sentinela pela marca, e o nome pelo da mesa", () => {
    const mixed = asMixedV6({
      ancestry: "mixed",
      label: "Corelliano",
      firstAncestry: "Human",
      secondAncestry: "Twilek",
    })

    expect(heritageOf(rosterV6ToV7(mixed))).toEqual({
      name: "Corelliano",
      sources: { first: "Human", second: "Twilek" },
      isMixed: true,
    })
  })

  /* Migração não adivinha escolha de ninguém: a 1ª fonte que a versão anterior
     copiava da espécie anterior fica onde está, porque apagá-la tiraria uma
     feature de uma ficha em jogo. */
  it("mista pela metade atravessa como está, sem inventar a fonte que falta", () => {
    const half = asMixedV6({
      ancestry: "mixed",
      label: null,
      firstAncestry: "Human",
      secondAncestry: null,
    })

    expect(heritageOf(rosterV6ToV7(half))).toEqual({
      name: null,
      sources: { first: "Human", second: null },
      isMixed: true,
    })
  })
})
