import {
  ARMOR_LINE_MODIFIERS,
  BARE_BONES,
  BASE_STRESS,
  DEFAULT_LOADOUT_SIZE,
  DOMAIN_CARDS_PER_LEVEL,
  LEVEL_ACHIEVEMENT_LEVELS,
  MAX_ARMOR_SCORE,
  MAX_HIT_POINTS,
  MAX_LEVEL,
  MAX_PROFICIENCY,
  MAX_STRESS,
  MIN_LEVEL,
  STARTING_DOMAIN_CARDS,
  STARTING_PROFICIENCY,
  TIER_BOUNDARIES,
  TRAIT_LIST,
  UNARMORED,
} from "@/constants"
import type {
  Character,
  ClassDefinition,
  Compendium,
  DerivedStats,
  EquippedArmor,
  HouseRules,
  Modifier,
  Tier,
  Trait,
} from "@/types"

import { clampStat, createModifierCollector, resolveStat } from "./stat"

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

const findClass = (compendium: Compendium, className: string | null): ClassDefinition | null =>
  compendium.classes.find((candidate) => candidate.name === className) ?? null

const isTrait = (value: string): value is Trait => TRAIT_LIST.includes(value as Trait)

/** Resolve a armadura vestida contra a linha e o tier dela. */
export const resolveEquippedArmor = (
  character: Character,
  compendium: Compendium,
): EquippedArmor | null => {
  const entry = character.inventory.find(
    (candidate) => candidate.kind === "armor" && candidate.isEquipped,
  )

  if (!entry) {
    return null
  }

  const named = compendium.namedArmor.find((candidate) => candidate.name === entry.name)

  if (!named) {
    return null
  }

  const line = compendium.armorLines.find((candidate) => candidate.name === named.line)

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
 * Cartas de domínio que o personagem deveria conhecer.
 *
 * Duas na criação e uma por nível a partir do 2 — ou duas, com a regra da
 * casa. O advancement "carta adicional" soma uma a cada vez que foi comprado.
 */
const expectedCardsFor = (
  level: number,
  houseRules: HouseRules,
  domainCardAdvancements: number,
): number => {
  const perLevel = houseRules.hasTwoCardsPerLevel ? 2 : DOMAIN_CARDS_PER_LEVEL

  return STARTING_DOMAIN_CARDS + (level - 1) * perLevel + domainCardAdvancements
}

/**
 * Ficha + regras da casa + compêndio → tudo que aparece na tela.
 *
 * O compêndio vem por parâmetro porque é dado de runtime — pode ter vindo do
 * banco. `rules/` continua puro: não sabe de onde ele veio.
 *
 * Chamada em todo render. É O(nº de advancements) — no pior caso vinte
 * entradas. Sem memoização até aparecer no profiler.
 *
 * Nada do que sai daqui é gravado: derivado nunca é guardado.
 */
export const derive = (
  character: Character,
  houseRules: HouseRules,
  compendium: Compendium,
): DerivedStats => {
  const level = clampLevel(character.level)
  const tier = tierOf(level)
  const classDefinition = findClass(compendium, character.className)
  const equippedArmor = resolveEquippedArmor(character, compendium)
  const collector = createModifierCollector()

  /* ── advancements: cada um com o nível em que foi comprado ───────── */

  let domainCardAdvancements = 0

  for (const advancement of character.advancements) {
    const source = { kind: "advancement", level: advancement.level } as const

    switch (advancement.kind) {
      case "trait":
        if (isTrait(advancement.detail)) {
          collector.add({ target: `trait.${advancement.detail}`, value: 1, source })
        }
        break
      case "hp":
        collector.add({ target: "hitPointsMax", value: 1, source })
        break
      case "stress":
        collector.add({ target: "stressMax", value: 1, source })
        break
      case "evasion":
        collector.add({ target: "evasion", value: 1, source })
        break
      case "proficiency":
        collector.add({ target: "proficiency", value: 1, source })
        break
      case "domainCard":
        domainCardAdvancements += 1
        break
      default:
        break
    }
  }

  /* ── traços ──────────────────────────────────────────────────────── */

  // Very Heavy custa −1 de Agility. Resolvido antes de tudo que lê traço.
  if (equippedArmor) {
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

  const isUnarmored = equippedArmor === null
  const hasBareBones = isUnarmored && character.loadout.includes(BARE_BONES.cardName)

  const levelModifier = (
    target: "majorThreshold" | "severeThreshold",
    multiplier: number,
  ): Modifier => ({
    target,
    value: level * multiplier,
    source: { kind: "level", level, multiplier },
  })

  let armorScoreBase: number = UNARMORED.armorScore
  let majorBase = 0
  let severeBase = 0
  let majorModifiers: Modifier[] = [levelModifier("majorThreshold", UNARMORED.majorLevelMultiplier)]
  let severeModifiers: Modifier[] = [
    levelModifier("severeThreshold", UNARMORED.severeLevelMultiplier),
  ]

  if (equippedArmor) {
    armorScoreBase = equippedArmor.baseScore
    majorBase = equippedArmor.majorBase
    severeBase = equippedArmor.severeBase
    majorModifiers = [levelModifier("majorThreshold", 1)]
    severeModifiers = [levelModifier("severeThreshold", 1)]

    collector.add({
      target: "evasion",
      value: equippedArmor.evasionModifier,
      source: { kind: "armor", entryId: equippedArmor.entryId, name: equippedArmor.name },
    })
  }

  if (hasBareBones) {
    const bareBonesSource = { kind: "skill", name: BARE_BONES.cardName } as const
    const thresholds = BARE_BONES.thresholdsByTier[tier]

    // Base da carta, e não modificador: Bare Bones **substitui** a base de
    // quem está sem armadura. Strength já passou pelos modificadores.
    armorScoreBase = BARE_BONES.armorScoreBase
    majorBase = thresholds.majorBase
    severeBase = thresholds.severeBase
    majorModifiers = [levelModifier("majorThreshold", 1)]
    severeModifiers = [levelModifier("severeThreshold", 1)]

    collector.add({
      target: "armorScore",
      value: traits.Strength.total,
      source: bareBonesSource,
    })
  }

  /* ── Evasion ─────────────────────────────────────────────────────── */

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

  /* ── Proficiency ─────────────────────────────────────────────────── */

  for (const achievementLevel of LEVEL_ACHIEVEMENT_LEVELS) {
    if (level >= achievementLevel) {
      collector.add({
        target: "proficiency",
        value: 1,
        source: { kind: "levelAchievement", level: achievementLevel },
      })
    }
  }

  return {
    level,
    tier,
    traits,
    proficiency: clampStat(
      resolveStat(STARTING_PROFICIENCY, collector.for("proficiency")),
      MAX_PROFICIENCY,
    ),
    evasion: resolveStat(classDefinition?.evasion ?? 0, collector.for("evasion")),
    armorScore: clampStat(
      resolveStat(armorScoreBase, collector.for("armorScore")),
      MAX_ARMOR_SCORE,
    ),
    hitPointsMax: clampStat(
      resolveStat(classDefinition?.hitPoints ?? 0, collector.for("hitPointsMax")),
      MAX_HIT_POINTS,
    ),
    stressMax: clampStat(resolveStat(BASE_STRESS, collector.for("stressMax")), MAX_STRESS),
    majorThreshold: resolveStat(majorBase, majorModifiers),
    severeThreshold: resolveStat(severeBase, severeModifiers),
    loadoutMax: resolveStat(loadoutMaxFor(houseRules, tier), []),
    expectedCards: expectedCardsFor(level, houseRules, domainCardAdvancements),
    equippedArmor,
    isUnarmored,
    hasBareBones,
  }
}
