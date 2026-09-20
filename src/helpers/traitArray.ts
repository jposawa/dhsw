import {
  ROLLED_TRAIT_DICE,
  ROLLED_TRAIT_OFFSET,
  ROLLED_TRAIT_SIDES,
  STARTING_TRAIT_ARRAY,
  TRAIT_LIST,
} from "@/constants"
import type { Character, HouseRules, RandomDie, Trait, TraitValues } from "@/types"

/**
 * O array de atributos: quais valores existem para distribuir, e onde cada um
 * foi parar.
 *
 * O livro dá seis valores fixos e manda espalhá-los (p. 16). A regra da casa
 * sorteia os seis no lugar. Nos dois casos a ficha guarda **o array** e **a
 * distribuição** em separado.
 *
 * **Atributo por distribuir é `null`, não zero.** Zero é um valor legítimo do
 * array — usá-lo também como "ainda não escolhi" faria uma ficha nova parecer
 * ter dois atributos já colocados. `derive` lê `null` como zero, então a ficha
 * continua somando enquanto não se distribui.
 */

/** Os valores desta ficha. Sem array próprio, vale o do livro. */
export const traitArrayOf = (character: Character): readonly number[] =>
  character.traitArray ?? STARTING_TRAIT_ARRAY

/** Nenhum atributo distribuído — como nasce uma ficha. */
export const NO_TRAITS: TraitValues = TRAIT_LIST.reduce(
  (traits, trait) => ({ ...traits, [trait]: null }),
  {} as TraitValues,
)

/**
 * Sorteia um array: por atributo, 2d4, fica o maior, menos 2.
 *
 * Puro — o sorteio entra por parâmetro, como no rolador, e é o que deixa o
 * teste verificar o intervalo sem depender de sorte.
 */
export const rollTraitArray = (random: RandomDie): number[] =>
  TRAIT_LIST.map(() => {
    const dice = Array.from({ length: ROLLED_TRAIT_DICE }, () => random(ROLLED_TRAIT_SIDES))

    return Math.max(...dice) + ROLLED_TRAIT_OFFSET
  })

/**
 * Qual posição do array cada atributo ocupa. `null` em atributo por
 * distribuir, e também no que tem valor fora do array — o que acontece em
 * ficha montada antes desta regra.
 *
 * Por posição e não por valor porque o array tem repetidos: marcando por
 * valor, escolher um `0` acenderia as duas cópias dele.
 */
export const traitArraySlots = (character: Character): Readonly<Record<Trait, number | null>> => {
  const array = traitArrayOf(character)
  const taken = new Set<number>()

  return TRAIT_LIST.reduce((slots, trait) => {
    const value = character.traits[trait]
    const slot =
      value === null
        ? -1
        : array.findIndex((candidate, index) => !taken.has(index) && candidate === value)

    if (slot >= 0) {
      taken.add(slot)
    }

    return { ...slots, [trait]: slot >= 0 ? slot : null }
  }, {} as Record<Trait, number | null>)
}

/** O que ainda não foi colocado em atributo nenhum. */
export const remainingTraitValues = (character: Character): number[] => {
  const array = traitArrayOf(character)
  const taken = new Set(Object.values(traitArraySlots(character)).filter((slot) => slot !== null))

  return array.filter((_unused, index) => !taken.has(index))
}

/** Distribuído quando todos os seis atributos têm valor do array. */
export const isTraitArrayDistributed = (character: Character): boolean =>
  TRAIT_LIST.every((trait) => traitArraySlots(character)[trait] !== null)

/**
 * Põe um valor num atributo.
 *
 * Se o valor está livre, entra. Se já está noutro atributo, os dois **trocam**
 * — que é o que a pessoa quer dizer ao pôr o +2 em cima de onde está o −1. O
 * atributo que cede fica com o que o outro tinha, inclusive `null`.
 */
export const assignTraitValue = (character: Character, trait: Trait, value: number): Character => {
  if (remainingTraitValues(character).includes(value)) {
    return { ...character, traits: { ...character.traits, [trait]: value } }
  }

  const holder = TRAIT_LIST.find(
    (candidate) => candidate !== trait && character.traits[candidate] === value,
  )

  if (!holder) {
    return character
  }

  return {
    ...character,
    traits: {
      ...character.traits,
      [trait]: value,
      [holder]: character.traits[trait],
    },
  }
}

/** Tira o valor de um atributo, devolvendo-o ao monte. */
export const clearTraitValue = (character: Character, trait: Trait): Character => ({
  ...character,
  traits: { ...character.traits, [trait]: null },
})

/** O array com que a ficha nasce. `null` é o do livro. */
export const startingTraitArray = (houseRules: HouseRules, random: RandomDie): number[] | null =>
  houseRules.hasRolledTraitArray ? rollTraitArray(random) : null
