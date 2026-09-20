import { ADVANCEMENTS_PER_LEVEL } from "@/constants"
import type {
  Advancement,
  AdvancementChange,
  AdvancementKind,
  Character,
  Level,
  Trait,
} from "@/types"

import { isTrait } from "./domain"

/**
 * Os avanços de nível, e o que cada um move.
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
  /** O atributo escolhido entra pelo `detail` — ver `changesFor`. */
  trait: [],
  /** Não movem número: mudam o que a ficha alcança, não quanto ela tem. */
  subclass: [],
  multiclass: [],
  experience: [],
}

/** Proficiency e multiclasse custam os dois avanços do nível (p. 110). */
const DOUBLE_SLOT_KINDS: ReadonlySet<AdvancementKind> = new Set(["proficiency", "multiclass"])

/**
 * Os modificadores de um avanço.
 *
 * `detail` só entra no de atributo, que é o único cuja escolha vira número —
 * nos outros ele guarda o domínio da multiclasse ou o nome da Experience.
 */
export const changesFor = (
  kind: AdvancementKind,
  detail: string,
): readonly AdvancementChange[] => {
  if (kind === "trait") {
    return isTrait(detail) ? [{ target: `trait.${detail as Trait}`, value: 1 }] : []
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
    (soma, advancement) => soma + advancement.slotsSpent,
    0,
  )

  return { total, spent, remaining: Math.max(total - spent, 0) }
}

/** Quanto um avanço deste tipo custa. */
export const slotsFor = (kind: AdvancementKind): 1 | 2 =>
  DOUBLE_SLOT_KINDS.has(kind) ? 2 : 1

/** Monta um avanço já com os modificadores dele. É por aqui que a tela cria. */
export const createAdvancement = (
  level: Level,
  kind: AdvancementKind,
  detail = "",
): Advancement => ({
  level,
  kind,
  detail,
  changes: changesFor(kind, detail),
  slotsSpent: DOUBLE_SLOT_KINDS.has(kind) ? 2 : 1,
})
