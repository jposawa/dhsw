import type { Trait } from "./domain"

/**
 * Modelo de característica: valor base, modificadores, valor final.
 *
 * A regra que organiza tudo aqui: **só o base é guardado**. Todo modificador
 * é recalculado a partir do que está equipado, conhecido e escolhido — nunca
 * persistido. Guardar o total significa recalcular à mão a cada troca de
 * armadura, e a primeira que passar batida deixa um threshold errado na mesa.
 */

/** Tudo que pode receber modificador. */
export type StatKey =
  | `trait.${Trait}`
  | "evasion"
  | "armorScore"
  | "majorThreshold"
  | "severeThreshold"
  | "hitPointsMax"
  | "stressMax"
  | "proficiency"
  | "loadoutMax"
  | "damage"
  | "attackRoll"

/**
 * De onde o modificador veio. É o que permite à UI dizer
 * "+1 de Padded Flightsuit" em vez de "+1 de algum lugar".
 */
export type ModifierSource =
  | { kind: "base" }
  | { kind: "class"; name: string }
  | { kind: "subclass"; name: string; feature: string }
  | { kind: "ancestry"; name: string; feature: string }
  | { kind: "community"; name: string; feature: string }
  | { kind: "advancement"; level: number }
  /** O nível somado aos thresholds. `multiplier` 2 é o Severe de quem está sem armadura. */
  | { kind: "level"; level: number; multiplier: number }
  /** O +1 permanente de Proficiency dos níveis 2, 5 e 8. */
  | { kind: "levelAchievement"; level: number }
  | { kind: "armor"; entryId: string; name: string }
  | { kind: "weapon"; entryId: string; name: string }
  | { kind: "module"; entryId: string; moduleName: string }
  | { kind: "item"; entryId: string; name: string }
  | { kind: "skill"; name: string }
  | { kind: "houseRule"; rule: string }
  | { kind: "situational"; label: string }

export type Modifier = {
  target: StatKey
  value: number
  source: ModifierSource
}

/**
 * Uma característica resolvida: o que a UI precisa para mostrar
 * "12" e, ao toque, "10 base, +1 Flexible, +1 nível 5".
 */
export type ResolvedStat = {
  base: number
  modifiers: readonly Modifier[]
  total: number
}

/**
 * Modificador de momento — vantagem de cobertura, um aliado ajudando,
 * uma condição do Mestre. **Nunca é gravado no personagem**: existe só
 * dentro do preparo de uma rolagem e morre com ela.
 */
export type SituationalModifier = {
  target: StatKey
  value: number
  label: string
}

/** O que sai de `prepareRoll`: dados a rolar e de onde veio cada soma. */
export type RollPreparation = {
  trait: Trait
  /** Sempre 2d12 em Daggerheart: Hope e Fear. */
  dice: "Hope d12 + Fear d12"
  stat: ResolvedStat
  situational: readonly SituationalModifier[]
  /** stat.total + soma dos situacionais. */
  total: number
}
