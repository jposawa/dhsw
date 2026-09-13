import { DOWNTIME_MOVES_PER_REST, HOPE_MAX } from "@/constants"
import { fail, ok } from "@/helpers"
import type {
  Character,
  Compendium,
  DerivedStats,
  DowntimeChoice,
  Marks,
  Result,
  RestKind,
} from "@/types"

/**
 * Descanso: duas ações de downtime da lista do descanso escolhido.
 *
 * Nada é limpo sozinho — é a escolha que limpa. Core Rulebook, "Downtime"
 * (p. 105). Trocar cartas entre Loadout e vault acontece antes, na aba Cartas.
 */

const clampMark = (value: number, max: number): number => Math.min(max, Math.max(0, value))

export const movesForRest = (compendium: Compendium, rest: RestKind) =>
  compendium.downtimeMoves.filter((move) => move.rest === rest)

/** Quanto uma ação rolada limpa: o dado mais o Tier. */
export const rolledClearAmount = (rolled: number, derived: DerivedStats): number =>
  rolled + derived.tier

export const takeRest = (
  character: Character,
  derived: DerivedStats,
  rest: RestKind,
  choices: readonly DowntimeChoice[],
  compendium: Compendium,
): Result<Character> => {
  if (choices.length !== DOWNTIME_MOVES_PER_REST) {
    return fail("downtimeNeedsTwoMoves")
  }

  const available = movesForRest(compendium, rest)
  const maxFor = {
    hp: derived.hitPointsMax.total,
    stress: derived.stressMax.total,
    armor: derived.armorScore.total,
  }

  // Parte da marca já dentro do limite: armadura trocada pode ter deixado
  // mais slots marcados do que existem.
  let marks: Marks = {
    hp: clampMark(character.marks.hp, maxFor.hp),
    stress: clampMark(character.marks.stress, maxFor.stress),
    armor: clampMark(character.marks.armor, maxFor.armor),
    hope: character.marks.hope,
  }

  for (const choice of choices) {
    const move = available.find((candidate) => candidate.id === choice.moveId)

    if (!move) {
      return fail("downtimeMoveUnknown", choice.moveId)
    }

    const { effect } = move

    if (effect.kind === "clearRolled") {
      if (choice.rolled === null) {
        return fail("downtimeRollMissing", move.name)
      }

      if (effect.canTargetAlly && choice.isOnAlly) {
        continue
      }

      const cleared = rolledClearAmount(choice.rolled, derived)
      marks = { ...marks, [effect.marker]: clampMark(marks[effect.marker] - cleared, maxFor[effect.marker]) }
    }

    if (effect.kind === "clearAll" && !(effect.canTargetAlly && choice.isOnAlly)) {
      marks = { ...marks, [effect.marker]: 0 }
    }

    if (effect.kind === "gainHope") {
      const gained = choice.isWithParty ? effect.withPartyAmount : effect.amount
      marks = { ...marks, hope: clampMark(marks.hope + gained, HOPE_MAX) }
    }
  }

  return ok({ ...character, marks })
}
