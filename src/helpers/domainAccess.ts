import { DOMAIN_LIST, EARLY_MULTICLASS_MIN_TIER, MULTICLASS_MIN_TIER } from "@/constants"
import type { Character, Compendium, Domain, HouseRules, Skill } from "@/types"

import { clampLevel, tierOf } from "./derive"

/**
 * Até que nível de carta o personagem alcança em cada domínio.
 *
 * Nos domínios da classe, cartas do nível do personagem ou abaixo. No domínio
 * que veio de multiclasse, até metade do nível, arredondando para cima. Core
 * Rulebook, "Taking Domain Cards" e "Multiclassing" (p. 111).
 *
 * O domínio da multiclasse é o `detail` do advancement `multiclass`. Sem
 * classe escolhida, os seis domínios ficam abertos no nível do personagem —
 * é a ficha em montagem, e esconder tudo seria uma tela vazia sem explicação.
 */
export const domainAccessFor = (
  character: Character,
  compendium: Compendium,
): readonly { domain: Domain; maxLevel: number }[] => {
  const level = clampLevel(character.level)
  const classDefinition = compendium.classes.find((candidate) => candidate.name === character.className)
  const classDomains: readonly Domain[] = classDefinition?.domains ?? DOMAIN_LIST

  const access = classDomains.map((domain) => ({ domain, maxLevel: level }))

  for (const advancement of character.advancements) {
    const domain = DOMAIN_LIST.find((candidate) => candidate === advancement.detail)

    if (advancement.kind === "multiclass" && domain && !classDomains.includes(domain)) {
      access.push({ domain, maxLevel: Math.ceil(level / 2) })
    }
  }

  return access
}

/** As cartas que o personagem pode aprender agora, pelo domínio e pelo nível. */
export const learnableSkills = (character: Character, compendium: Compendium): readonly Skill[] => {
  const access = domainAccessFor(character, compendium)

  return compendium.skills.filter((skill) =>
    access.some((entry) => entry.domain === skill.domain && skill.level <= entry.maxLevel),
  )
}

/**
 * Se multiclasse já está disponível no nível. Tier 3 pela regra; Tier 2 com a
 * regra da casa, que continua custando os dois advancements do nível.
 */
export const canMulticlass = (level: number, houseRules: HouseRules): boolean =>
  tierOf(level) >= (houseRules.allowsEarlyMulticlass ? EARLY_MULTICLASS_MIN_TIER : MULTICLASS_MIN_TIER)
