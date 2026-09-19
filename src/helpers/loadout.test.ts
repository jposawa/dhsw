import { describe, expect, it } from "vitest"

import { TEST_COMPENDIUM } from "@/compendium/testing"
import { DEFAULT_HOUSE_RULES } from "@/constants"
import { createCharacter } from "@/helpers"
import type { Character, DerivedStats } from "@/types"

import { derive } from "./sheet"
import { learnSkill } from "./loadout"

const soldier = (level = 1): Character => ({
  ...createCharacter("Teste"),
  className: "Soldier",
  level,
})

const statsOf = (character: Character): DerivedStats =>
  derive(character, DEFAULT_HOUSE_RULES, TEST_COMPENDIUM)

/** As cartas que este personagem alcança, na ordem do compêndio. */
const reachable = (character: Character) =>
  TEST_COMPENDIUM.skills.filter(
    (skill) =>
      (skill.domain === "Aegis" || skill.domain === "Havoc") && skill.level <= character.level,
  )

const learn = (character: Character, name: string): Character => {
  const result = learnSkill(character, statsOf(character), name, TEST_COMPENDIUM)

  if (!result.ok) {
    throw new Error(`não aprendeu ${name}: ${result.code}`)
  }

  return result.value
}

describe("learnSkill", () => {
  /* Carta nova nunca esteve guardada, então não há recall a cobrar: ela vai
     para a mão, que é onde quem acabou de aprender quer usá-la. */
  it("com espaço no loadout, a carta vai direto para a mão", () => {
    const hero = learn(soldier(), reachable(soldier())[0].name)

    expect(hero.loadout).toHaveLength(1)
    expect(hero.vault).toEqual([])
  })

  it("não cobra Stress por aprender", () => {
    const antes = soldier()
    const depois = learn(antes, reachable(antes)[0].name)

    expect(depois.marks.stress).toBe(antes.marks.stress)
  })

  /* O teto do loadout é regra, e o atalho não pode furá-lo.

     O loadout cheio é montado à mão: encher aprendendo carta a carta dependeria
     de o compêndio de teste ter cartas suficientes no nível, o que não é o que
     este teste está verificando. */
  it("com o loadout cheio, a carta cai no vault", () => {
    const cartas = reachable(soldier(5))
    const teto = statsOf(soldier(5)).loadoutMax.total
    const cheio: Character = {
      ...soldier(5),
      loadout: cartas.slice(0, teto).map((carta) => carta.name),
    }

    const nova = cartas[teto].name
    const depois = learn(cheio, nova)

    expect(depois.loadout).toHaveLength(teto)
    expect(depois.vault).toEqual([nova])
  })

  it("aprender o que já se sabe não duplica nem move", () => {
    const hero = learn(soldier(), reachable(soldier())[0].name)

    expect(learn(hero, hero.loadout[0])).toEqual(hero)
  })
})
