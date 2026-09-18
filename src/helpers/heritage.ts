import type { Character, Compendium } from "@/types"

/**
 * Ascendência: a espécie da ficha, e a mista.
 *
 * **Mista é escolher features, não somar espécies.** A primeira feature vem de
 * uma espécie e a segunda, de outra — nunca as duas da mesma (Core Rulebook,
 * "Mixed Ancestry", p. 70–71). Por isso a ficha guarda só a segunda espécie:
 * a ordem das features já diz de onde cada uma veio.
 */

/** "**High Stamina** — Ganhe um slot…" → "High Stamina". */
export const featureNameOf = (text: string): string | null =>
  /\*\*(.+?)\*\*/.exec(text)?.[1]?.trim() ?? null

export type HeritageFeature = {
  /** A espécie que dá esta feature. */
  ancestry: string
  /** 0 é a primeira feature da espécie; 1, a segunda. */
  index: 0 | 1
  text: string
  name: string | null
}

/** As duas features da ascendência, na ordem: a primeira de uma espécie, a segunda da outra. */
export const heritageFeatures = (
  character: Character,
  compendium: Compendium,
): HeritageFeature[] => {
  const primary = compendium.ancestries.find(
    (candidate) => candidate.name === character.ancestry,
  )
  const second = character.mixedAncestry
    ? compendium.ancestries.find((candidate) => candidate.name === character.mixedAncestry)
    : primary

  const features: HeritageFeature[] = []

  if (primary?.features[0]) {
    features.push({
      ancestry: primary.name,
      index: 0,
      text: primary.features[0],
      name: featureNameOf(primary.features[0]),
    })
  }

  if (second?.features[1]) {
    features.push({
      ancestry: second.name,
      index: 1,
      text: second.features[1],
      name: featureNameOf(second.features[1]),
    })
  }

  return features
}

/**
 * Como a ascendência se escreve na ficha: "Pantoran" ou "Pantoran-Twi'lek".
 * O livro deixa o nome a gosto da mesa; aqui o padrão é juntar as duas.
 */
export const heritageLabel = (character: Character): string | null => {
  if (!character.ancestry) {
    return null
  }

  return character.mixedAncestry
    ? `${character.ancestry}-${character.mixedAncestry}`
    : character.ancestry
}
