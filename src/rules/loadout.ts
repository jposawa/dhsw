import { SKILLS } from "@/compendium"
import { fail, ok } from "@/helpers"
import type { Character, DerivedStats, Result } from "@/types"

/**
 * Loadout e vault, conforme o SRD.
 *
 * Livre durante descanso e downtime; fora disso, trazer carta do vault custa
 * Stress igual ao Recall Cost.
 *
 * Erros voltam como `Result`, nunca exceção: a UI mapeia o código para a
 * mensagem e nunca reimplementa a condição. STANDARDS.md.
 */

const findSkill = (skillName: string) =>
  SKILLS.find((skill) => skill.name === skillName)

export const isKnown = (character: Character, skillName: string): boolean =>
  character.loadout.includes(skillName) || character.vault.includes(skillName)

/** Vault → loadout. Custa Stress fora do descanso. */
export const moveToLoadout = (
  character: Character,
  derived: DerivedStats,
  skillName: string,
  options: { isFreeSwap: boolean },
): Result<Character> => {
  const skill = findSkill(skillName)

  if (!skill) {
    return fail("skillUnknown", skillName)
  }

  if (character.loadout.includes(skillName)) {
    return fail("skillAlreadyInLoadout", skillName)
  }

  if (!character.vault.includes(skillName)) {
    return fail("skillUnknown", skillName)
  }

  if (character.loadout.length >= derived.loadoutMax.total) {
    return fail("loadoutFull")
  }

  const stressCost = options.isFreeSwap ? 0 : skill.recallCost
  const availableStress = derived.stressMax.total - character.marks.stress

  if (stressCost > availableStress) {
    return fail("notEnoughStress", `Recall Cost ${skill.recallCost}`)
  }

  return ok({
    ...character,
    loadout: [...character.loadout, skillName],
    vault: character.vault.filter((name) => name !== skillName),
    marks: { ...character.marks, stress: character.marks.stress + stressCost },
  })
}

/** Loadout → vault. Sempre livre: guardar carta não custa nada no SRD. */
export const moveToVault = (character: Character, skillName: string): Result<Character> => {
  if (!character.loadout.includes(skillName)) {
    return fail("skillUnknown", skillName)
  }

  return ok({
    ...character,
    loadout: character.loadout.filter((name) => name !== skillName),
    vault: [...character.vault, skillName],
  })
}

/** Aprender carta nova: entra no vault. */
export const learnSkill = (character: Character, skillName: string): Result<Character> => {
  if (!findSkill(skillName)) {
    return fail("skillUnknown", skillName)
  }

  if (isKnown(character, skillName)) {
    return ok(character)
  }

  return ok({ ...character, vault: [...character.vault, skillName] })
}

export const forgetSkill = (character: Character, skillName: string): Result<Character> =>
  ok({
    ...character,
    loadout: character.loadout.filter((name) => name !== skillName),
    vault: character.vault.filter((name) => name !== skillName),
  })
