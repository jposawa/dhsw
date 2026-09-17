import { fail, ok } from "@/helpers"
import type { Character, Experience, Result } from "@/types"

/**
 * Experiences e anotações.
 *
 * **Sem limite de quantidade escrito aqui.** O SRD dá duas na criação e mais
 * uma por tier, mas quantas a mesa concede é decisão da mesa — travar um
 * número no código transformaria uma escolha do Narrador em erro do app. O
 * que a regra garante é o que não pode variar: nome não em branco e nome não
 * repetido, senão duas linhas iguais competem pela mesma rolagem.
 */

export const addExperience = (
  character: Character,
  experience: Experience,
): Result<Character> => {
  const name = experience.name.trim()

  if (!name) {
    return fail("experienceNameMissing")
  }

  if (character.experiences.some((candidate) => candidate.name === name)) {
    return fail("experienceDuplicate", name)
  }

  return ok({
    ...character,
    experiences: [...character.experiences, { ...experience, name }],
  })
}

export const removeExperience = (character: Character, name: string): Result<Character> => {
  if (!character.experiences.some((candidate) => candidate.name === name)) {
    return fail("experienceNotFound", name)
  }

  return ok({
    ...character,
    experiences: character.experiences.filter((candidate) => candidate.name !== name),
  })
}

export const setExperienceBonus = (
  character: Character,
  name: string,
  bonus: number,
): Result<Character> => {
  if (!character.experiences.some((candidate) => candidate.name === name)) {
    return fail("experienceNotFound", name)
  }

  return ok({
    ...character,
    experiences: character.experiences.map((candidate) =>
      candidate.name === name ? { ...candidate, bonus } : candidate,
    ),
  })
}
