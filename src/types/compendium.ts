import type { DamageType, Domain, Level, Range, Tier, Trait, WeaponBurden } from "./domain"

export type SkillCategory = "Ability" | "Force" | "Holocron"

/** Carta de domínio. Referenciada por nome — ver DOMAIN.md. */
export type Skill = {
  name: string
  domain: Domain
  level: Level
  recallCost: number
  category: SkillCategory
  text: string
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

export type SubclassFeature = {
  name: string
  text: string
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
  /** Rótulo cru do protótipo ("+1 Evasion", "—"). O número sai de ARMOR_LINE_EVASION. */
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
