import { MIXED_ANCESTRY_LABEL, MIXED_ANCESTRY_SEPARATOR } from "@/constants"
import type { Character, Compendium, Heritage } from "@/types"

/**
 * Ascendência: como ela se guarda e o que ela rende em features.
 *
 * **Toda ascendência tem a mesma forma** — um nome e as duas fontes de
 * feature. A mista não é um formato à parte nem um código especial no campo do
 * nome: é o mesmo objeto com duas espécies diferentes nas fontes e um nome que
 * a mesa escolhe. Quem lê (`heritageFeatures`, `derive`) não precisa saber de
 * qual dos dois casos se trata.
 */

/** Ascendência em branco: nenhuma escolha feita. */
export const NO_HERITAGE: Heritage = {
  name: null,
  sources: { first: null, second: null },
  isMixed: false,
}

/**
 * Espécie única: o nome dela **é** a ascendência, e as duas features saem da
 * mesma espécie.
 */
export const singleAncestry = (ancestry: string): Heritage => ({
  name: ancestry,
  sources: { first: ancestry, second: ancestry },
  isMixed: false,
})

/**
 * Mista: ascendência própria, e por isso **em branco**.
 *
 * Nada da espécie escolhida antes é aproveitado aqui. Herdar a anterior como
 * 1ª feature tratava a mista como uma variação dela, e não há nada na regra
 * que ligue as duas: quem troca para mista está trocando de ascendência, não
 * acrescentando uma metade à que tinha.
 */
export const mixedAncestry = (): Heritage => ({
  name: null,
  sources: { first: null, second: null },
  isMixed: true,
})

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

/**
 * As features da ascendência: a primeira da fonte da primeira, a segunda da
 * fonte da segunda. Na única as duas fontes são a mesma espécie, e é por isso
 * que não há ramo para mista aqui.
 */
export const heritageFeatures = (
  character: Character,
  compendium: Compendium,
): HeritageFeature[] => {
  const { sources } = character.heritage
  const slots = [
    { name: sources.first, index: 0 as const },
    { name: sources.second, index: 1 as const },
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
 * As duas espécies juntas, no estilo "goblin-orc" do livro — **só com as duas
 * escolhidas**. Com uma só, o par ainda não existe: escrever o nome dela
 * sozinho daria uma mistura com cara de espécie única.
 */
export const mixtureName = (heritage: Heritage): string | null => {
  const { first, second } = heritage.sources

  return first && second ? [first, second].join(MIXED_ANCESTRY_SEPARATOR) : null
}

/**
 * Como a ascendência se escreve na ficha.
 *
 * O nome guardado vale primeiro: na única ele é a espécie, na mista é o que a
 * mesa deu. Sem nome, a mista cai no par de espécies e, enquanto o par está
 * pela metade, no que ela é — mista. Ascendência nenhuma não diz nada.
 */
export const heritageLabel = (character: Character): string | null => {
  const { heritage } = character

  if (heritage.name?.trim()) {
    return heritage.name.trim()
  }

  return heritage.isMixed ? (mixtureName(heritage) ?? MIXED_ANCESTRY_LABEL) : null
}
