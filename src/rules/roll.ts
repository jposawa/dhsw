import type {
  DerivedStats,
  RollPreparation,
  SituationalModifier,
  Trait,
} from "@/types"

/**
 * Preparo de rolagem — o único lugar onde modificador situacional existe.
 *
 * Cobertura, aliado ajudando, condição do Mestre: tudo isso é de momento.
 * Nada aqui é gravado no personagem, e nada aqui entra em `derive` — se um
 * modificador sobrevive à rolagem, ele não era situacional, era um efeito
 * de item ou de carta e pertence à ficha.
 */
export const prepareRoll = (
  derived: DerivedStats,
  trait: Trait,
  situational: readonly SituationalModifier[] = [],
): RollPreparation => {
  const stat = derived.traits[trait]
  const relevant = situational.filter(
    (modifier) => modifier.target === `trait.${trait}` || modifier.target === "attackRoll",
  )

  const situationalTotal = relevant.reduce(
    (runningTotal, modifier) => runningTotal + modifier.value,
    0,
  )

  return {
    trait,
    dice: "Hope d12 + Fear d12",
    stat,
    situational: relevant,
    total: stat.total + situationalTotal,
  }
}
