import { MIXED_ANCESTRY, MIXED_ANCESTRY_SEPARATOR } from "@/constants"
import type { Character, Compendium, Heritage } from "@/types"

/**
 * Ascendência: o código guardado na ficha e o que ele rende em features.
 *
 * `heritage.ancestry` é **código**: o nome de uma espécie, ou `MIXED_ANCESTRY`.
 * Na mista, a ficha guarda de qual espécie vem cada feature — a primeira de
 * uma, a segunda de outra, nunca as duas da mesma (Core Rulebook, p. 70–71) —
 * e o nome que a mesa deu à mistura.
 */

/** Ascendência em branco: nenhuma escolha feita. */
export const NO_HERITAGE: Heritage = {
  ancestry: null,
  label: null,
  firstAncestry: null,
  secondAncestry: null,
}

export const isMixedAncestry = (heritage: Heritage): boolean =>
  heritage.ancestry === MIXED_ANCESTRY

/** "**High Stamina** — Ganhe um slot…" → "High Stamina". */
export const featureNameOf = (text: string): string | null =>
  /\*\*(.+?)\*\*/.exec(text)?.[1]?.trim() ?? null

/** De qual espécie vem cada feature. Na única, as duas vêm da mesma. */
export const ancestriesOf = (heritage: Heritage): { first: string | null; second: string | null } =>
  isMixedAncestry(heritage)
    ? { first: heritage.firstAncestry, second: heritage.secondAncestry }
    : { first: heritage.ancestry, second: heritage.ancestry }

export type HeritageFeature = {
  /** A espécie que dá esta feature. */
  ancestry: string
  /** 0 é a primeira feature da espécie; 1, a segunda. */
  index: 0 | 1
  text: string
  name: string | null
}

/** As features da ascendência: a primeira de uma espécie, a segunda de outra. */
export const heritageFeatures = (
  character: Character,
  compendium: Compendium,
): HeritageFeature[] => {
  const { first, second } = ancestriesOf(character.heritage)
  const slots = [
    { name: first, index: 0 as const },
    { name: second, index: 1 as const },
  ]

  return slots.flatMap(({ name, index }) => {
    const ancestry = compendium.ancestries.find((candidate) => candidate.name === name)
    const text = ancestry?.features[index]

    return ancestry && text
      ? [{ ancestry: ancestry.name, index, text, name: featureNameOf(text) }]
      : []
  })
}

/**
 * Como a ascendência se escreve na ficha.
 *
 * Espécie única é o nome dela. Mista é o nome que a mesa deu; sem nome, as
 * duas espécies juntas — o livro deixa a escolha livre ("goblin-orc", ou um
 * nome inventado). Mista sem nenhuma das duas escolhida ainda não diz nada.
 */
export const heritageLabel = (character: Character): string | null => {
  const { heritage } = character

  if (!isMixedAncestry(heritage)) {
    return heritage.ancestry
  }

  if (heritage.label?.trim()) {
    return heritage.label.trim()
  }

  const names = [heritage.firstAncestry, heritage.secondAncestry].filter(Boolean)

  return names.length > 0 ? names.join(MIXED_ANCESTRY_SEPARATOR) : null
}
