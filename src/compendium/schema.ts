import { z } from "zod"

import { DAMAGE_KIND_LIST, DAMAGE_TYPE_LIST, DOMAIN_LIST, RANGE_LIST, TRAIT_LIST } from "@/constants"
import type {
  Ancestry,
  Augment,
  ArmorLine,
  ArmorLineName,
  ClassDefinition,
  Community,
  CompendiumCollection,
  CompendiumEntry,
  DomainDefinition,
  DowntimeMove,
  EquipmentFeature,
  NamedArmor,
  Skill,
  SkillCategory,
  Subclass,
  Tier,
  TokenPool,
  Weapon,
} from "@/types"

/**
 * O formato de cada coleção do compêndio.
 *
 * É a fronteira com o banco: o que chega do Realtime Database passa por aqui
 * antes de virar regra, e o JSON do repositório passa pelo mesmo teste. Cada
 * schema é tipado contra o tipo de `types/` — se um divergir do outro, o
 * compilador acusa.
 */

const ARMOR_LINE_NAMES: readonly ArmorLineName[] = ["Flexible", "Neutra", "Heavy", "Very Heavy"]
const SKILL_CATEGORIES: readonly SkillCategory[] = ["Ability", "Force", "Holocron"]

const name = z.string().trim().min(1)
const level = z.number().int().min(1).max(10)
const tier = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]) satisfies z.ZodType<Tier>

const tokenPool = z.object({
  scale: z.enum(["tier", "proficiency", "forcewield", ...TRAIT_LIST]).optional(),
  isHalved: z.boolean().optional(),
  minimum: z.number().int().min(0).optional(),
  refill: z.enum(["rest", "longRest", "manual"]),
}) satisfies z.ZodType<TokenPool>

const skill = z.object({
  name,
  domain: z.enum(DOMAIN_LIST),
  level,
  recallCost: z.number().int().min(0),
  category: z.enum(SKILL_CATEGORIES),
  text: z.string(),
  imageUrl: z.url().optional(),
  tokens: tokenPool.optional(),
}) satisfies z.ZodType<Skill>

const domain = z.object({
  name: z.enum(DOMAIN_LIST),
  description: z.string(),
}) satisfies z.ZodType<DomainDefinition>

const classDefinition = z.object({
  name,
  evasion: z.number().int(),
  hitPoints: z.number().int().min(1),
  domains: z.array(z.enum(DOMAIN_LIST)),
  subclasses: z.array(name),
  features: z.array(z.object({ name, text: z.string(), tokens: tokenPool.optional() })).default([]),
  hopeFeature: z.string(),
}) satisfies z.ZodType<ClassDefinition>

const featureModifier = z.object({
  target: z.enum([
    ...TRAIT_LIST.map((trait) => `trait.${trait}` as const),
    "evasion",
    "armorScore",
    "majorThreshold",
    "severeThreshold",
    "hitPointsMax",
    "stressMax",
    "proficiency",
  ]),
  value: z.number().int().optional(),
  valueByTier: z.array(z.number().int()).length(4).optional(),
}).refine((modifier) => (modifier.value === undefined) !== (modifier.valueByTier === undefined), {
  message: "modificador tem value ou valueByTier, um dos dois",
})

const equipmentFeature = z.object({
  name,
  text: z.string().min(1),
  modifiers: z.array(featureModifier).optional(),
}) satisfies z.ZodType<EquipmentFeature>

const subclassFeature = z.object({
  name,
  text: z.string(),
  modifiers: z.array(featureModifier).optional(),
  tokens: tokenPool.optional(),
})

const subclass = z.object({
  name,
  className: name,
  spellcastTrait: z.string(),
  foundation: z.array(subclassFeature).default([]),
  specialization: z.array(subclassFeature).default([]),
  mastery: z.array(subclassFeature).default([]),
}) satisfies z.ZodType<Subclass>

const ancestry = z.object({
  name,
  description: z.string(),
  features: z.array(z.string()).default([]),
  modifiers: z
    .array(z.intersection(featureModifier, z.object({ feature: name })))
    .optional(),
}) satisfies z.ZodType<Ancestry>

const community = z.object({
  name,
  description: z.string(),
  feature: z.string(),
}) satisfies z.ZodType<Community>

const armorLine = z.object({
  name: z.enum(ARMOR_LINE_NAMES),
  feature: z.string().nullable().default(null),
  tiers: z
    .array(
      z.object({
        baseScore: z.number().int().min(0),
        majorBase: z.number().int().min(0),
        severeBase: z.number().int().min(0),
      }),
    )
    .length(4),
}) satisfies z.ZodType<ArmorLine>

const namedArmor = z.object({
  name,
  line: z.enum(ARMOR_LINE_NAMES),
  tier,
  feature: z.string().nullable().default(null),
}) satisfies z.ZodType<NamedArmor>

const weapon = z.object({
  name,
  trait: z.enum([...TRAIT_LIST, "Forcewield"]),
  range: z.enum(RANGE_LIST),
  damageDie: z.string().regex(/^d\d+$/),
  bonusByTier: z.array(z.number().int()).length(4),
  damageType: z.enum(DAMAGE_TYPE_LIST),
  damageKind: z.enum(DAMAGE_KIND_LIST),
  burden: z.string(),
  feature: z.string().nullable().default(null),
  customizable: z.number().int().min(0).nullable().default(null),
}) satisfies z.ZodType<Weapon>

const augment = z.object({
  name,
  tier,
  text: z.string().min(1),
  modifiers: z.array(featureModifier).optional(),
  damageBonus: z.number().int().optional(),
  attackBonus: z.number().int().optional(),
}) satisfies z.ZodType<Augment>

const entry = z.object({
  name,
  tier,
  text: z.string(),
}) satisfies z.ZodType<CompendiumEntry>

const downtimeMarker = z.enum(["hp", "stress", "armor"])

const downtimeMove = z.object({
  id: name,
  name,
  rest: z.enum(["short", "long"]),
  text: z.string(),
  effect: z.discriminatedUnion("kind", [
    z.object({
      kind: z.literal("clearRolled"),
      marker: downtimeMarker,
      dice: z.string().regex(/^\d+d\d+$/),
      canTargetAlly: z.boolean(),
    }),
    z.object({ kind: z.literal("clearAll"), marker: downtimeMarker, canTargetAlly: z.boolean() }),
    z.object({
      kind: z.literal("gainHope"),
      amount: z.number().int().min(0),
      withPartyAmount: z.number().int().min(0),
    }),
    z.object({ kind: z.literal("narrative") }),
  ]),
}) satisfies z.ZodType<DowntimeMove>

export const COMPENDIUM_SCHEMAS = {
  skills: z.array(skill),
  domains: z.array(domain),
  classes: z.array(classDefinition),
  subclasses: z.array(subclass),
  ancestries: z.array(ancestry),
  communities: z.array(community),
  armorLines: z.array(armorLine),
  namedArmor: z.array(namedArmor),
  weapons: z.array(weapon),
  items: z.array(entry),
  consumables: z.array(entry),
  features: z.array(equipmentFeature),
  augments: z.array(augment),
  downtimeMoves: z.array(downtimeMove),
} satisfies Record<CompendiumCollection, z.ZodType>

export const COMPENDIUM_COLLECTIONS = Object.keys(COMPENDIUM_SCHEMAS) as CompendiumCollection[]
