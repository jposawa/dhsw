import {
  ADVANCEMENT_OPTIONS,
  ADVANCEMENT_PICKS,
  ADVANCEMENTS_PER_LEVEL,
  DOMAIN_LIST,
  MULTICLASS_LIMIT,
  TIER_BOUNDARIES,
  TRAIT_LIST,
} from "@/constants"
import type {
  Advancement,
  AdvancementChange,
  AdvancementKind,
  AdvancementOption,
  Character,
  HouseRules,
  Level,
  Tier,
  Trait,
} from "@/types"

import { isTrait } from "./domain"
import { canMulticlass } from "./domainAccess"
import { tierOf } from "./sheet"

/**
 * Os avanços de nível: o que cada um move, quanto custa, e quais o tier ainda
 * oferece.
 *
 * **O avanço carrega os próprios modificadores.** Quem lê — `derive` — só os
 * repete; não há um `switch` sobre o tipo do avanço espalhado pela
 * matemática. É o que permite um avanço de regra da casa existir sem tocar em
 * `sheet.ts`, e é o que faz o histórico de níveis explicar de onde veio cada
 * número da ficha.
 *
 * Core Rulebook, "Leveling Up" (p. 109–111).
 */

/** O que cada avanço do livro move. Avanço sem número tem lista vazia. */
const CHANGES_BY_KIND: Readonly<Record<AdvancementKind, readonly AdvancementChange[]>> = {
  hp: [{ target: "hitPointsMax", value: 1 }],
  stress: [{ target: "stressMax", value: 1 }],
  evasion: [{ target: "evasion", value: 1 }],
  proficiency: [{ target: "proficiency", value: 1 }],
  domainCard: [{ target: "domainCards", value: 1 }],
  /** Os dois atributos e as duas Experiences entram pelos `details`. */
  trait: [],
  experience: [],
  /** Não movem número: mudam o que a ficha alcança, não quanto ela tem. */
  subclass: [],
  multiclass: [],
}

/** Proficiency e multiclasse custam os dois avanços do nível (p. 110). */
const DOUBLE_SLOT_KINDS: ReadonlySet<AdvancementKind> = new Set(["proficiency", "multiclass"])

/** O rótulo de um avanço, para o histórico e para os avisos. */
export const advancementLabel = (kind: AdvancementKind): string =>
  ADVANCEMENT_OPTIONS.find((option) => option.kind === kind)?.label ?? kind

/**
 * Os modificadores de um avanço.
 *
 * Os dois avanços que pedem escolha levantam **dois** de uma vez — dois
 * atributos, ou duas Experiences (p. 110) —, e cada escolha vira um
 * modificador. Nos outros, `details` guarda o que não é número: o domínio da
 * multiclasse.
 */
export const changesFor = (
  kind: AdvancementKind,
  details: readonly string[],
): readonly AdvancementChange[] => {
  if (kind === "trait") {
    return details
      .filter((detail): detail is Trait => isTrait(detail))
      .map((trait) => ({ target: `trait.${trait}` as const, value: 1 }))
  }

  // A Experience é alvo pelo nome, que é único na ficha. Apagada a Experience,
  // o modificador deixa de achar dono e some da conta sozinho — sem número
  // solto sobrando, e sem reescrever o nível em que o avanço foi comprado.
  if (kind === "experience") {
    return details.map((name) => ({ target: `experience.${name}` as const, value: 1 }))
  }

  return CHANGES_BY_KIND[kind]
}

/**
 * Quantos avanços este nível deu, quantos já foram gastos e quanto sobra.
 *
 * O nível 1 não dá avanço: ele é a criação. Do 2 em diante, dois por nível —
 * e é por isso que subir o nível não muda número nenhum sozinho: o que muda a
 * ficha é escolher o que fazer com os avanços.
 */
export const advancementSlots = (
  character: Character,
): { total: number; spent: number; remaining: number } => {
  const total = (character.level - 1) * ADVANCEMENTS_PER_LEVEL
  const spent = character.advancements.reduce(
    (sum, advancement) => sum + advancement.slotsSpent,
    0,
  )

  return { total, spent, remaining: Math.max(total - spent, 0) }
}

/** Quanto um avanço deste tipo custa. */
export const slotsFor = (kind: AdvancementKind): 1 | 2 =>
  DOUBLE_SLOT_KINDS.has(kind) ? 2 : 1

/** Quantas escolhas o avanço pede antes de existir. */
export const picksFor = (kind: AdvancementKind): number => {
  if (kind === "trait" || kind === "experience") {
    return ADVANCEMENT_PICKS
  }

  return kind === "multiclass" ? 1 : 0
}

/** Em que nível um tier começa. */
const tierStart = (tier: Tier): number =>
  TIER_BOUNDARIES.find((boundary) => boundary.tier === tier)?.minLevel ?? 1

/**
 * Os avanços comprados dentro do tier atual.
 *
 * A folha de level up é **por tier**: os slots de cada opção valem para o
 * tier, e o que foi gasto no anterior não ocupa nada aqui.
 */
export const advancementsInTier = (character: Character): readonly Advancement[] => {
  const start = tierStart(tierOf(character.level))

  return character.advancements.filter((advancement) => advancement.level >= start)
}

/** Quantas vezes este avanço já foi comprado no tier atual. */
export const timesTakenInTier = (character: Character, kind: AdvancementKind): number =>
  advancementsInTier(character).filter((advancement) => advancement.kind === kind).length

/**
 * Os atributos marcados: os que subiram neste tier.
 *
 * A marca é o que impede subir o mesmo atributo duas vezes seguidas, e ela só
 * se limpa no level achievement do tier seguinte — níveis 5 e 8 (p. 109).
 * Como toda marca vem de avanço comprado no tier, quem subiu aqui está
 * marcado, e ninguém mais.
 */
export const markedTraits = (character: Character): readonly Trait[] =>
  advancementsInTier(character)
    .filter((advancement) => advancement.kind === "trait")
    .flatMap((advancement) =>
      advancement.details.filter((detail): detail is Trait => isTrait(detail)),
    )

/** O que este avanço ainda pode escolher: atributo sem marca, Experience, domínio. */
export const picksAvailableFor = (
  character: Character,
  kind: AdvancementKind,
): readonly string[] => {
  if (kind === "trait") {
    const marked = markedTraits(character)

    return TRAIT_LIST.filter((trait) => !marked.includes(trait))
  }

  if (kind === "experience") {
    return character.experiences.map((experience) => experience.name)
  }

  return kind === "multiclass" ? DOMAIN_LIST : []
}

/**
 * As opções que cabem agora, cada uma com quantas vezes ainda cabe no tier.
 *
 * Três coisas fecham uma opção, e nenhuma delas é o nível solto:
 *
 * - **o tier não a oferece** — subclasse melhorada, Proficiency e multiclasse
 *   só existem do Tier 3 em diante, e o Tier 2 só alcança a multiclasse com a
 *   regra da casa;
 * - **os slots dela acabaram** no tier, ou o nível não tem avanço de sobra
 *   para pagar o que ela custa;
 * - **não há o que escolher**: faltam dois atributos sem marca, ou duas
 *   Experiences na ficha.
 *
 * Subclasse melhorada e multiclasse se excluem dentro do tier: quem multiclassa
 * risca uma melhoria de subclasse, e quem melhora a subclasse risca a
 * multiclasse daquele tier (p. 110–111).
 */
export const availableAdvancements = (
  character: Character,
  houseRules: HouseRules,
): readonly { option: AdvancementOption; remaining: number }[] => {
  const tier = tierOf(character.level)
  const slots = advancementSlots(character)
  const multiclassTaken = character.advancements.filter(
    (advancement) => advancement.kind === "multiclass",
  ).length

  return ADVANCEMENT_OPTIONS.map((option) => ({
    option,
    remaining: option.slotsByTier[tier - 1] - timesTakenInTier(character, option.kind),
  })).filter(({ option, remaining }) => {
    if (remaining <= 0 || slotsFor(option.kind) > slots.remaining) {
      return false
    }

    if (option.kind === "multiclass") {
      return (
        canMulticlass(character.level, houseRules) &&
        multiclassTaken < MULTICLASS_LIMIT &&
        timesTakenInTier(character, "subclass") === 0
      )
    }

    if (option.kind === "subclass") {
      return timesTakenInTier(character, "multiclass") === 0
    }

    return picksAvailableFor(character, option.kind).length >= picksFor(option.kind)
  })
}

/** Monta um avanço já com os modificadores dele. É por aqui que a tela cria. */
export const createAdvancement = (
  level: Level,
  kind: AdvancementKind,
  details: readonly string[] = [],
): Advancement => ({
  level,
  kind,
  details,
  changes: changesFor(kind, details),
  slotsSpent: DOUBLE_SLOT_KINDS.has(kind) ? 2 : 1,
})
