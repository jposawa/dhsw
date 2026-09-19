import { fail, ok } from "@/helpers"
import type { Character, Compendium, DerivedStats, Result } from "@/types"

import { learnableSkills } from "./domainAccess"

/**
 * Loadout e vault, conforme o SRD.
 *
 * Livre durante descanso e downtime; fora disso, trazer carta do vault custa
 * Stress igual ao Recall Cost.
 *
 * Erros voltam como `Result`, nunca exceção: a UI mapeia o código para a
 * mensagem e nunca reimplementa a condição. STANDARDS.md.
 */

const findSkill = (compendium: Compendium, skillName: string) =>
  compendium.skills.find((skill) => skill.name === skillName)

export const isKnown = (character: Character, skillName: string): boolean =>
  character.loadout.includes(skillName) || character.vault.includes(skillName)

/** Vault → loadout. Custa Stress fora do descanso. */
export const moveToLoadout = (
  character: Character,
  derived: DerivedStats,
  skillName: string,
  options: { isFreeSwap: boolean },
  compendium: Compendium,
): Result<Character> => {
  const skill = findSkill(compendium, skillName)

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

/**
 * Aprender carta nova: vai direto para o loadout se couber, senão para o vault.
 *
 * **Não custa Stress**, e é por isso que não passa por `moveToLoadout`: o
 * custo do SRD é do *recall* — trazer de volta o que estava guardado no meio
 * da cena. Carta recém-aprendida nunca esteve guardada, e cobrar por ela seria
 * punir quem subiu de nível.
 *
 * Com o loadout cheio ela cai no vault, como antes: o teto é regra, e o atalho
 * não pode furá-lo.
 */
export const learnSkill = (
  character: Character,
  derived: DerivedStats,
  skillName: string,
  compendium: Compendium,
): Result<Character> => {
  if (!findSkill(compendium, skillName)) {
    return fail("skillUnknown", skillName)
  }

  if (!learnableSkills(character, compendium).some((skill) => skill.name === skillName)) {
    return fail("skillNotLearnable", skillName)
  }

  if (isKnown(character, skillName)) {
    return ok(character)
  }

  // `derived` vem de fora, como em `moveToLoadout`: quem chama já o tem, e
  // recalcular a ficha inteira aqui seria pagar de novo pelo mesmo número.
  return character.loadout.length < derived.loadoutMax.total
    ? ok({ ...character, loadout: [...character.loadout, skillName] })
    : ok({ ...character, vault: [...character.vault, skillName] })
}

export const forgetSkill = (character: Character, skillName: string): Result<Character> =>
  ok({
    ...character,
    loadout: character.loadout.filter((name) => name !== skillName),
    vault: character.vault.filter((name) => name !== skillName),
  })
