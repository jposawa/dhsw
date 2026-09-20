import { FALLBACK_FEATURE_PROMPTS } from "@/constants"
import type { Character, Compendium, FeaturePrompt } from "@/types"

import { heritageFeatures } from "./heritage"

/**
 * Os campos que as features desta ficha pedem por escrito.
 *
 * **O compêndio manda.** A lista embutida em `constants/featurePrompts.ts` é
 * só rede: ela cobre o que o banco ainda não declara, e some sozinha assim que
 * a coleção ganhar o campo `prompts`. Sem a rede, escrever no compêndio e
 * escrever no app teriam de acontecer no mesmo dia.
 */

/** Uma pergunta da ficha: a feature que a faz, e qual das linhas dela é. */
export type FeatureField = {
  /** Chave de gravação. A feature mais o índice — ver `Character.featureNotes`. */
  key: string
  feature: string
  /** "Tenet 1" — sem o número quando a feature pede um campo só. */
  label: string
  /** Faixa do campo numérico. Ausente é campo de texto. Ver `FeaturePrompt`. */
  min?: number
  max?: number
}

const promptsOf = (
  declared: readonly FeaturePrompt[] | undefined,
  featureNames: readonly string[],
): readonly FeaturePrompt[] => {
  const fromCompendium = (declared ?? []).filter((prompt) =>
    featureNames.includes(prompt.feature),
  )

  if (fromCompendium.length > 0) {
    return fromCompendium
  }

  return FALLBACK_FEATURE_PROMPTS.filter((prompt) => featureNames.includes(prompt.feature))
}

/** A chave com que a resposta é gravada. Estável: nome da feature e a linha. */
export const featureFieldKey = (feature: string, index: number): string => `${feature}:${index}`

/**
 * Todas as linhas que esta ficha tem para preencher, na ordem em que a tela
 * as mostra. Vazio na ficha cuja espécie e origem não pedem nada.
 */
export const featureFieldsFor = (
  character: Character,
  compendium: Compendium,
): readonly FeatureField[] => {
  // Na ordem das cartas da ficha: classe, espécie, origem.
  const classDefinition = compendium.classes.find(
    (candidate) => candidate.name === character.className,
  )

  const fromClass = classDefinition
    ? promptsOf(
        classDefinition.prompts,
        classDefinition.features.map((feature) => feature.name),
      )
    : []

  const ancestryFeatures = heritageFeatures(character, compendium)

  const fromAncestries = ancestryFeatures.flatMap((feature) => {
    const ancestry = compendium.ancestries.find((candidate) => candidate.name === feature.ancestry)

    return promptsOf(ancestry?.prompts, feature.name === null ? [] : [feature.name])
  })

  const community = compendium.communities.find(
    (candidate) => candidate.name === character.community,
  )

  const fromCommunity = community
    ? promptsOf(community.prompts, [featureNameOf(community.feature)])
    : []

  return [...fromClass, ...fromAncestries, ...fromCommunity].flatMap((prompt) =>
    Array.from({ length: prompt.count }, (_unused, index) => ({
      key: featureFieldKey(prompt.feature, index),
      feature: prompt.feature,
      // Numerar um campo só seria "Número 1" sem existir o 2.
      label: prompt.count === 1 ? prompt.label : `${prompt.label} ${index + 1}`,
      min: prompt.min,
      max: prompt.max,
    })),
  )
}

/** Os nomes das features que pedem algo por escrito, sem repetir e na ordem da tela. */
export const featurePromptNamesFor = (
  character: Character,
  compendium: Compendium,
): readonly string[] => [
  ...new Set(featureFieldsFor(character, compendium).map((field) => field.feature)),
]

/** "**Tenets** — Escolha três…" → "Tenets". O mesmo recorte de `heritage.ts`. */
const featureNameOf = (text: string): string => /\*\*(.+?)\*\*/.exec(text)?.[1]?.trim() ?? ""
