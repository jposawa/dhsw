import { NEW_EXPERIENCE_BONUS } from "@/constants"
import type { Character, Result } from "@/types"

import { fail, ok } from "./result"
import { expectedExperiencesFor } from "./sheet"

/**
 * As Experiences da ficha.
 *
 * Duas coisas aqui não são escolha de quem joga, e por isso não são campo na
 * tela:
 *
 * - **quantas**: duas na criação e uma a cada level achievement — níveis 2, 5
 *   e 8 (p. 109). Passar disso não é generosidade da mesa, é erro de conta: o
 *   nível 1 com três Experiences joga um jogo diferente do da mesa ao lado;
 * - **de quanto**: toda Experience nasce a +2 (p. 109). O que cresce vem do
 *   avanço "+1 em duas Experiences", e entra como modificador — o número
 *   guardado continua sendo o +2.
 *
 * O que sobra de regra é o que sempre foi: nome não em branco e nome não
 * repetido, senão duas linhas competem pela mesma rolagem.
 */

export const addExperience = (character: Character, rawName: string): Result<Character> => {
  const name = rawName.trim()

  if (!name) {
    return fail("experienceNameMissing")
  }

  if (character.experiences.some((candidate) => candidate.name === name)) {
    return fail("experienceDuplicate", name)
  }

  if (character.experiences.length >= expectedExperiencesFor(character.level)) {
    return fail("experienceLimit")
  }

  return ok({
    ...character,
    experiences: [...character.experiences, { name, bonus: NEW_EXPERIENCE_BONUS }],
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
