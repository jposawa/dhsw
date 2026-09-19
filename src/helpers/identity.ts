import { fail, ok } from "@/helpers"
import type { Character, Compendium, Result } from "@/types"

/**
 * Classe, subclasse, espécie e origem.
 *
 * Só a troca de classe tem regra: espécie e origem não prendem nada, e a
 * subclasse só precisa pertencer à classe.
 */

/**
 * Quantas vezes o advancement "subclasse melhorada" foi comprado. A primeira
 * dá a specialization, a segunda a mastery — Core Rulebook, "Leveling Up"
 * (p. 110): "If you have only the foundation card, take a specialization. If
 * you have a specialization already, take a mastery."
 */
export const subclassUpgradesOf = (character: Character): number =>
  character.advancements.filter((advancement) => advancement.kind === "subclass").length

/** O que se perde trocando de classe. Vazio quando não há o que perder. */
export type ClassChangeLoss = {
  subclass: string | null
  cardCount: number
}

export const classChangeLoss = (character: Character, className: string): ClassChangeLoss => {
  if (character.className === className) {
    return { subclass: null, cardCount: 0 }
  }

  return {
    subclass: character.subclass,
    cardCount: character.loadout.length + character.vault.length,
  }
}

/**
 * Troca a classe e desfaz o que dependia dela.
 *
 * - **Subclasse** some: ela pertence à classe, e um par inválido deixaria a
 *   ficha sem Forcewielding nem features.
 * - **Cartas de domínio** somem, loadout e vault: os domínios vêm da classe, e
 *   as cartas da classe antiga ficariam fora do alcance da nova.
 *
 * Os advancements ficam: foram comprados por nível, não pela classe, e a
 * "subclasse melhorada" passa a valer para a subclasse nova.
 */
export const changeClass = (
  character: Character,
  className: string,
  compendium: Compendium,
): Result<Character> => {
  if (!compendium.classes.some((candidate) => candidate.name === className)) {
    return fail("classUnknown", className)
  }

  if (character.className === className) {
    return ok(character)
  }

  return ok({
    ...character,
    className,
    subclass: null,
    loadout: [],
    vault: [],
  })
}

export const changeSubclass = (
  character: Character,
  subclassName: string,
  compendium: Compendium,
): Result<Character> => {
  const subclass = compendium.subclasses.find((candidate) => candidate.name === subclassName)

  if (!subclass || subclass.className !== character.className) {
    return fail("subclassNotOfClass", subclassName)
  }

  return ok({ ...character, subclass: subclass.name })
}
