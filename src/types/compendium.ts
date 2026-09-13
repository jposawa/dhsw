import type { DamageType, Domain, Level, Range, Tier, Trait, WeaponBurden } from "./domain"

export type SkillCategory = "Ability" | "Force" | "Holocron"

/** Carta de domínio. A ficha referencia por nome. */
export type Skill = {
  name: string
  domain: Domain
  level: Level
  recallCost: number
  category: SkillCategory
  text: string
  /** Arte da carta. Sem ela, a carta mostra o emblema do domínio no lugar. */
  imageUrl?: string
}

export type DomainDefinition = {
  name: Domain
  description: string
}

export type ClassDefinition = {
  name: string
  evasion: number
  hitPoints: number
  domains: readonly Domain[]
  subclasses: readonly string[]
  baseFeatures: string
  hopeFeature: string
}

/**
 * Característica que uma feature muda para sempre — "+1 slot de Stress", "+2
 * nos thresholds". Só entra onde o efeito é numérico e permanente; o resto da
 * feature continua sendo texto, e a maioria é.
 */
export type PermanentStatTarget =
  | "evasion"
  | "armorScore"
  | "majorThreshold"
  | "severeThreshold"
  | "hitPointsMax"
  | "stressMax"
  | "proficiency"

export type FeatureModifier = {
  target: PermanentStatTarget
  value: number
}

export type SubclassFeature = {
  name: string
  text: string
  modifiers?: readonly FeatureModifier[]
}

export type Subclass = {
  name: string
  className: string
  spellcastTrait: Trait | string
  foundation: readonly SubclassFeature[]
  specialization: readonly SubclassFeature[]
  mastery: readonly SubclassFeature[]
}

export type Ancestry = {
  name: string
  description: string
  /** Sempre duas, por padrão do SRD. */
  features: readonly string[]
  /** Efeito numérico permanente, com o nome da feature que o dá. */
  modifiers?: readonly (FeatureModifier & { feature: string })[]
}

export type Community = {
  name: string
  description: string
  /** Sempre uma, por padrão do SRD. A assimetria com Ancestry não é engano. */
  feature: string
}

export type ArmorLineName = "Flexible" | "Neutra" | "Heavy" | "Very Heavy"

export type ArmorTier = {
  /** Número de Armor Slots. */
  baseScore: number
  /** Some o nível do personagem para chegar ao threshold real. */
  majorBase: number
  severeBase: number
}

export type ArmorLine = {
  name: ArmorLineName
  /** Rótulo para leitura ("+1 Evasion", "—"). O número sai de `ARMOR_LINE_MODIFIERS`. */
  evasionLabel: string
  tiers: readonly ArmorTier[]
}

export type NamedArmor = {
  name: string
  line: ArmorLineName
  tier: Tier
  feature: string | null
}

export type Weapon = {
  name: string
  trait: Trait | "Forcewield"
  range: Range
  damageDie: string
  /** Bônus de dano por tier, índice 0 = Tier 1. */
  bonusByTier: readonly number[]
  damageType: DamageType
  burden: WeaponBurden | string
  feature: string | null
  isIconic: boolean
}

/** Itens e consumíveis compartilham a forma. */
export type CompendiumEntry = {
  name: string
  tier: Tier
  text: string
}

export type RestKind = "short" | "long"

/** Marcador que uma ação de downtime limpa. */
export type DowntimeMarker = "hp" | "stress" | "armor"

/**
 * O que a ação faz com a ficha. `clearRolled` soma o Tier ao dado rolado;
 * `narrative` não mexe em número nenhum.
 */
export type DowntimeEffect =
  | { kind: "clearRolled"; marker: DowntimeMarker; dice: string; canTargetAlly: boolean }
  | { kind: "clearAll"; marker: DowntimeMarker; canTargetAlly: boolean }
  | { kind: "gainHope"; amount: number; withPartyAmount: number }
  | { kind: "narrative" }

/** Ação de downtime. Core Rulebook, "Downtime" (p. 105). */
export type DowntimeMove = {
  id: string
  name: string
  rest: RestKind
  text: string
  effect: DowntimeEffect
}

/**
 * Uma das duas ações escolhidas num descanso. A mesma ação pode vir duas vezes.
 *
 * `rolled` é o resultado do dado de `clearRolled` — o Tier soma a regra.
 * `isOnAlly` gasta a ação em outra ficha, e esta não muda.
 */
export type DowntimeChoice = {
  moveId: string
  rolled: number | null
  isOnAlly: boolean
  isWithParty: boolean
}

/**
 * O compêndio inteiro, uma coleção por chave.
 *
 * Vem do Realtime Database quando existe lá, coleção a coleção, e cai no JSON
 * de `compendium/data/` quando não existe ou não passa na validação. Ver
 * `services/compendiumService.ts`.
 */
export type Compendium = {
  skills: readonly Skill[]
  domains: readonly DomainDefinition[]
  classes: readonly ClassDefinition[]
  subclasses: readonly Subclass[]
  ancestries: readonly Ancestry[]
  communities: readonly Community[]
  armorLines: readonly ArmorLine[]
  namedArmor: readonly NamedArmor[]
  weapons: readonly Weapon[]
  items: readonly CompendiumEntry[]
  consumables: readonly CompendiumEntry[]
  downtimeMoves: readonly DowntimeMove[]
}

export type CompendiumCollection = keyof Compendium

/**
 * De onde veio cada coleção. `remote` é do banco; `fallback` é o JSON do
 * repositório — porque o banco não tem, ou tem algo que não valida.
 */
export type CompendiumOrigin = Readonly<Record<CompendiumCollection, "remote" | "fallback">>
