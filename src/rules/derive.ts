import { ARMOR_LINES, CLASSES, NAMED_ARMOR } from "@/compendium"
import {
  ARMOR_LINE_MODIFIERS,
  BARE_BONES_ARMOR_SCORE_BASE,
  BARE_BONES_THRESHOLDS,
  BASE_STRESS,
  DEFAULT_LOADOUT_SIZE,
  MAX_LEVEL,
  MIN_LEVEL,
  TIER_BOUNDARIES,
  TRAIT_LIST,
} from "@/constants"
import type {
  Character,
  ClassDefinition,
  DerivedStats,
  EquippedArmor,
  HouseRules,
  Modifier,
  Tier,
  Trait,
} from "@/types"

import { createModifierCollector, resolveStat } from "./stat"

/** Tier é derivado do nível, sempre. Nunca guardado. */
export const tierOf = (level: number): Tier => {
  const clamped = clampLevel(level)
  const found = TIER_BOUNDARIES.find(
    (boundary) => clamped >= boundary.minLevel && clamped <= boundary.maxLevel,
  )

  return found ? found.tier : 1
}

export const clampLevel = (level: number): number =>
  Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, Math.trunc(level) || MIN_LEVEL))

const findClass = (className: string | null): ClassDefinition | null =>
  CLASSES.find((candidate) => candidate.name === className) ?? null

/** Resolve a armadura vestida contra a linha e o tier dela. */
export const resolveEquippedArmor = (character: Character): EquippedArmor | null => {
  const entry = character.inventory.find(
    (candidate) => candidate.kind === "armor" && candidate.isEquipped,
  )

  if (!entry) {
    return null
  }

  const named = NAMED_ARMOR.find((candidate) => candidate.name === entry.name)

  if (!named) {
    return null
  }

  const line = ARMOR_LINES.find((candidate) => candidate.name === named.line)

  if (!line) {
    return null
  }

  const tierRow = line.tiers[named.tier - 1]
  const modifiers = ARMOR_LINE_MODIFIERS[named.line]

  return {
    entryId: entry.id,
    name: named.name,
    line: named.line,
    tier: named.tier,
    baseScore: tierRow.baseScore,
    majorBase: tierRow.majorBase,
    severeBase: tierRow.severeBase,
    evasionModifier: modifiers.evasion,
    agilityModifier: modifiers.agility,
    feature: named.feature,
  }
}

/** Soma os advancements por tipo. Histórico → total, nunca o contrário. */
const tallyAdvancements = (character: Character) => {
  const tally = {
    trait: 0,
    hp: 0,
    stress: 0,
    evasion: 0,
    proficiency: 0,
    thresholds: 0,
  }

  for (const advancement of character.advancements) {
    if (advancement.kind in tally) {
      tally[advancement.kind as keyof typeof tally] += 1
    }
  }

  return tally
}

const loadoutMaxFor = (houseRules: HouseRules, tier: Tier): number => {
  switch (houseRules.loadoutSize) {
    case "3+tier":
      return 3 + tier
    case "4+tier":
      return 4 + tier
    default:
      return DEFAULT_LOADOUT_SIZE
  }
}

/**
 * Ficha + regras da casa → tudo que aparece na tela.
 *
 * Chamada em todo render. É O(nº de advancements) — no pior caso vinte
 * entradas. Sem memoização até aparecer no profiler.
 *
 * Nada do que sai daqui é gravado. Ver DOMAIN.md, "derivado nunca é guardado".
 */
export const derive = (character: Character, houseRules: HouseRules): DerivedStats => {
  const level = clampLevel(character.level)
  const tier = tierOf(level)
  const classDefinition = findClass(character.className)
  const equippedArmor = resolveEquippedArmor(character)
  const advancements = tallyAdvancements(character)
  const collector = createModifierCollector()

  /* ── traços ──────────────────────────────────────────────────────── */

  // Very Heavy custa −1 de Agility. É o único modificador de traço vindo
  // de equipamento hoje; módulos e features entram por aqui quando existirem.
  if (equippedArmor && equippedArmor.agilityModifier !== 0) {
    collector.add({
      target: "trait.Agility",
      value: equippedArmor.agilityModifier,
      source: { kind: "armor", entryId: equippedArmor.entryId, name: equippedArmor.name },
    })
  }

  const traits = TRAIT_LIST.reduce(
    (resolved, trait) => ({
      ...resolved,
      [trait]: resolveStat(character.traits[trait] ?? 0, collector.for(`trait.${trait}`)),
    }),
    {} as Record<Trait, ReturnType<typeof resolveStat>>,
  )

  /* ── armadura, Armor Score e thresholds ──────────────────────────── */

  const isBareBones = equippedArmor === null
  const bareBones = BARE_BONES_THRESHOLDS[tier]

  // Bare Bones usa o Strength JÁ MODIFICADO. Sem armadura vestida não há
  // penalidade de Agility, então na prática é o base — mas passar pelo
  // total é o que mantém a regra correta se um módulo mexer em Strength.
  const armorScoreBase = isBareBones
    ? BARE_BONES_ARMOR_SCORE_BASE + traits.Strength.total
    : equippedArmor.baseScore

  if (!isBareBones) {
    collector.add({
      target: "evasion",
      value: equippedArmor.evasionModifier,
      source: { kind: "armor", entryId: equippedArmor.entryId, name: equippedArmor.name },
    })
  }

  // Thresholds: base da armadura + Level. dh-sw-v2-spec.md §1.1
  const majorBase = isBareBones ? bareBones.majorBase : equippedArmor.majorBase
  const severeBase = isBareBones ? bareBones.severeBase : equippedArmor.severeBase

  const levelThresholdModifier = (): Modifier => ({
    target: "majorThreshold",
    value: level,
    source: { kind: "advancement", level },
  })

  const majorModifiers: Modifier[] = [levelThresholdModifier()]
  const severeModifiers: Modifier[] = [
    { ...levelThresholdModifier(), target: "severeThreshold" },
  ]

  if (advancements.thresholds > 0) {
    majorModifiers.push({
      target: "majorThreshold",
      value: advancements.thresholds,
      source: { kind: "advancement", level },
    })
    severeModifiers.push({
      target: "severeThreshold",
      value: advancements.thresholds,
      source: { kind: "advancement", level },
    })
  }

  /* ── Evasion ─────────────────────────────────────────────────────── */

  if (advancements.evasion > 0) {
    collector.add({
      target: "evasion",
      value: advancements.evasion,
      source: { kind: "advancement", level },
    })
  }

  // Regra da casa: Evasion escala com (Agility + Instinct) ÷ 2.
  if (houseRules.hasEvasionFromTraits) {
    const raw = (traits.Agility.total + traits.Instinct.total) / 2
    const rounded = houseRules.roundsEvasionUp ? Math.ceil(raw) : Math.floor(raw)

    collector.add({
      target: "evasion",
      value: rounded,
      source: { kind: "houseRule", rule: "(Agility + Instinct) ÷ 2" },
    })
  }

  /* ── HP, Stress, Proficiency ─────────────────────────────────────── */

  if (advancements.hp > 0) {
    collector.add({
      target: "hitPointsMax",
      value: advancements.hp,
      source: { kind: "advancement", level },
    })
  }

  if (advancements.stress > 0) {
    collector.add({
      target: "stressMax",
      value: advancements.stress,
      source: { kind: "advancement", level },
    })
  }

  if (advancements.proficiency > 0) {
    collector.add({
      target: "proficiency",
      value: advancements.proficiency,
      source: { kind: "advancement", level },
    })
  }

  return {
    level,
    tier,
    traits,
    proficiency: resolveStat(tier, collector.for("proficiency")),
    evasion: resolveStat(classDefinition?.evasion ?? 10, collector.for("evasion")),
    armorScore: resolveStat(Math.max(0, armorScoreBase), collector.for("armorScore")),
    hitPointsMax: resolveStat(
      classDefinition?.hitPoints ?? 6,
      collector.for("hitPointsMax"),
    ),
    stressMax: resolveStat(BASE_STRESS, collector.for("stressMax")),
    majorThreshold: resolveStat(majorBase, majorModifiers),
    severeThreshold: resolveStat(severeBase, severeModifiers),
    loadoutMax: resolveStat(loadoutMaxFor(houseRules, tier), []),
    expectedCards: level * (houseRules.hasTwoCardsPerLevel ? 2 : 1),
    equippedArmor,
    isBareBones,
  }
}
