import { describe, expect, it } from "vitest"

import { DEFAULT_HOUSE_RULES, STARTING_TRAIT_ARRAY, TRAIT_LIST } from "@/constants"
import type { Character, RandomDie } from "@/types"

import { createCharacter } from "./character"
import {
  assignTraitValue,
  isTraitArrayDistributed,
  NO_TRAITS,
  remainingTraitValues,
  rollTraitArray,
  startingTraitArray,
  traitArrayOf,
  traitArraySlots,
} from "./traitArray"

/** Devolve os valores na ordem pedida, um por dado sorteado. */
const sequence = (...values: number[]): RandomDie => {
  let index = 0

  return () => values[index++] ?? 1
}

const distributed = (...values: number[]): Character => ({
  ...createCharacter("Rey"),
  traits: Object.fromEntries(
    TRAIT_LIST.map((trait, index) => [trait, values[index]]),
  ) as Character["traits"],
})

describe("traitArrayOf", () => {
  it("sem array próprio, vale o do livro", () => {
    expect(traitArrayOf(createCharacter("Rey"))).toEqual(STARTING_TRAIT_ARRAY)
  })

  it("com array sorteado, vale o sorteado", () => {
    const character = { ...createCharacter("Rey"), traitArray: [2, 2, 2, 1, 0, 0] }

    expect(traitArrayOf(character)).toEqual([2, 2, 2, 1, 0, 0])
  })
})

describe("rollTraitArray", () => {
  /* Por atributo: 2d4, fica o maior, menos 2. */
  it("fica com o maior dos dois dados, menos dois", () => {
    const array = rollTraitArray(sequence(1, 4, 3, 2, 4, 4, 1, 1, 2, 3, 4, 1))

    expect(array).toEqual([2, 1, 2, -1, 1, 2])
  })

  it("dá um valor por atributo, sempre entre −1 e +2", () => {
    const array = rollTraitArray(() => Math.ceil(Math.random() * 4))

    expect(array).toHaveLength(TRAIT_LIST.length)
    expect(array.every((value) => value >= -1 && value <= 2)).toBe(true)
  })
})

describe("remainingTraitValues", () => {
  /* Ficha nova não tem atributo nenhum escolhido: os seis estão no monte. */
  it("ficha nova tem os seis por distribuir", () => {
    expect(remainingTraitValues(createCharacter("Rey"))).toEqual([...STARTING_TRAIT_ARRAY])
    expect(isTraitArrayDistributed(createCharacter("Rey"))).toBe(false)
  })

  it("distribuída, não sobra nada", () => {
    const character = distributed(2, 1, 1, 0, 0, -1)

    expect(remainingTraitValues(character)).toEqual([])
    expect(isTraitArrayDistributed(character)).toBe(true)
  })

  /* Zero é valor do array, não "vazio": pôr um zero tira um zero do monte. */
  it("o zero escolhido sai do monte, e o outro fica", () => {
    const meio = { ...createCharacter("Rey"), traits: { ...NO_TRAITS, Agility: 0 } }

    expect(remainingTraitValues(meio).sort((a, b) => a - b)).toEqual([-1, 0, 1, 1, 2])
  })
})

describe("assignTraitValue", () => {
  it("valor que está sobrando entra sem mexer nos outros", () => {
    const character = assignTraitValue(createCharacter("Rey"), TRAIT_LIST[0], 2)

    expect(character.traits[TRAIT_LIST[0]]).toBe(2)
    expect(character.traits[TRAIT_LIST[1]]).toBeNull()
  })

  /* Trocar com um atributo por distribuir devolve o `null` para ele. */
  it("trocar com quem não tinha valor devolve o vazio", () => {
    const meio = assignTraitValue(createCharacter("Rey"), TRAIT_LIST[0], 2)
    const trocado = assignTraitValue(meio, TRAIT_LIST[1], 2)

    expect(trocado.traits[TRAIT_LIST[1]]).toBe(2)
    expect(trocado.traits[TRAIT_LIST[0]]).toBeNull()
  })

  /* Sem sobra, os dois trocam de lugar: é o que a pessoa quer dizer ao pôr o
     +2 em cima de onde está outro valor. */
  it("valor já usado troca de lugar com quem o tinha", () => {
    const character = distributed(2, 1, 1, 0, 0, -1)
    const trocado = assignTraitValue(character, TRAIT_LIST[5], 2)

    expect(trocado.traits[TRAIT_LIST[5]]).toBe(2)
    expect(trocado.traits[TRAIT_LIST[0]]).toBe(-1)
  })
})

describe("startingTraitArray", () => {
  it("sem a regra da casa, a ficha usa o array do livro", () => {
    expect(startingTraitArray(DEFAULT_HOUSE_RULES, sequence(4))).toBeNull()
  })

  it("com a regra da casa, sorteia seis valores", () => {
    const houseRules = { ...DEFAULT_HOUSE_RULES, hasRolledTraitArray: true }

    expect(startingTraitArray(houseRules, sequence(4))).toHaveLength(TRAIT_LIST.length)
  })
})

describe("traitArraySlots", () => {
  /* O array tem dois 1 e dois 0: marcar por valor acenderia as duas cópias. */
  it("cada atributo toma uma posição, mesmo com valor repetido", () => {
    const slots = traitArraySlots(distributed(2, 1, 1, 0, 0, -1))

    expect(Object.values(slots)).toEqual([0, 1, 2, 3, 4, 5])
  })

  it("atributo por distribuir não ocupa posição", () => {
    expect(Object.values(traitArraySlots(createCharacter("Rey")))).toEqual([
      null, null, null, null, null, null,
    ])
  })

  it("atributo fora do array não ocupa posição", () => {
    const outsider = distributed(9, 1, 1, 0, 0, -1)

    expect(traitArraySlots(outsider)[TRAIT_LIST[0]]).toBeNull()
  })

  it("dois atributos com o mesmo valor tomam posições diferentes", () => {
    const slots = traitArraySlots(distributed(1, 1, 2, 0, 0, -1))

    expect(slots[TRAIT_LIST[0]]).not.toBe(slots[TRAIT_LIST[1]])
  })
})
