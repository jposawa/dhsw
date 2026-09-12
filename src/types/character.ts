import type { Level, Tier, Trait } from "./domain"
import type { ResolvedStat } from "./modifier"

export type InventoryEntryKind = "weapon" | "armor" | "item" | "consumable"
export type EquipSlot = "primary" | "secondary" | "armor"

export type InventoryEntry = {
  id: string
  kind: InventoryEntryKind
  /** Nome no compêndio. */
  name: string
  isEquipped: boolean
  slot: EquipSlot | null
  quantity: number
  /** Reservado para módulos por instância. Nenhuma regra lê isto ainda. */
  installedModules: readonly string[]
  nickname: string | null
}

export type AdvancementKind =
  | "trait"
  | "hp"
  | "stress"
  | "evasion"
  | "proficiency"
  | "subclass"
  | "multiclass"
  | "domainCard"
  | "experience"

export type Advancement = {
  level: Level
  kind: AdvancementKind
  detail: string
  /** Proficiency e multiclasse custam os dois advancements do nível. */
  slotsSpent: 1 | 2
}

export type Experience = {
  name: string
  bonus: number
}

/** Marcadores de mesa. Contagem, não array de booleanos — o máximo é derivado. */
export type Marks = {
  hp: number
  stress: number
  armor: number
  hope: number
}

export type Character = {
  id: string
  schema: number
  name: string
  createdAt: number
  updatedAt: number

  ancestry: string | null
  community: string | null
  className: string | null
  subclass: string | null
  level: Level

  /** Só o valor base. O final sai de `derive`. */
  traits: Record<Trait, number>

  marks: Marks

  loadout: readonly string[]
  vault: readonly string[]
  inventory: readonly InventoryEntry[]

  /**
   * A party a que a ficha pertence, ou `null`. Campo, e nao entidade a parte,
   * porque a relacao e 1:N de verdade — ver `types/party.ts`.
   */
  partyId: string | null

  /** Histórico, não resumo: dá para mostrar a progressão e desfazer o último nível. */
  advancements: readonly Advancement[]
  experiences: readonly Experience[]
  notes: string
}

/** Regras da casa. Escolha da mesa — viaja no código de compartilhamento. */
export type HouseRules = {
  hasTwoCardsPerLevel: boolean
  hasEvasionFromTraits: boolean
  roundsEvasionUp: boolean
  loadoutSize: "5" | "3+tier" | "4+tier"
}

/** Armadura equipada, já resolvida contra a linha e o tier. */
export type EquippedArmor = {
  entryId: string
  name: string
  line: string
  tier: Tier
  baseScore: number
  majorBase: number
  severeBase: number
  evasionModifier: number
  agilityModifier: number
  feature: string | null
}

/**
 * Tudo que é calculado. Nada aqui é gravado.
 * Cada campo é `ResolvedStat` para que a UI mostre base, modificadores e total.
 */
export type DerivedStats = {
  level: Level
  tier: Tier
  traits: Record<Trait, ResolvedStat>
  proficiency: ResolvedStat
  evasion: ResolvedStat
  armorScore: ResolvedStat
  hitPointsMax: ResolvedStat
  stressMax: ResolvedStat
  majorThreshold: ResolvedStat
  severeThreshold: ResolvedStat
  loadoutMax: ResolvedStat
  /** Cartas esperadas no nível atual, conforme a regra da casa. */
  expectedCards: number
  equippedArmor: EquippedArmor | null
  /** Sem armadura vestida: Armor Score 0, Major = nível, Severe = 2 × nível. */
  isUnarmored: boolean
  /** Sem armadura e com a carta Bare Bones no Loadout: vale a base da carta. */
  hasBareBones: boolean
}
