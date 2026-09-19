import type {
  DerivedStats,
  DicePreset,
  RollPreparation,
  SituationalModifier,
  Trait,
  Weapon,
} from "@/types"

/**
 * Preparo de rolagem — o único lugar onde modificador situacional existe.
 *
 * Cobertura, aliado ajudando, condição do Mestre: tudo isso é de momento.
 * Nada aqui é gravado no personagem, e nada aqui entra em `derive` — se um
 * modificador sobrevive à rolagem, ele não era situacional, era um efeito
 * de item ou de carta e pertence à ficha.
 */
export const prepareRoll = (
  derived: DerivedStats,
  trait: Trait,
  situational: readonly SituationalModifier[] = [],
): RollPreparation => {
  const stat = derived.traits[trait]
  const relevant = situational.filter(
    (modifier) => modifier.target === `trait.${trait}` || modifier.target === "attackRoll",
  )

  const situationalTotal = relevant.reduce(
    (runningTotal, modifier) => runningTotal + modifier.value,
    0,
  )

  return {
    trait,
    dice: "Hope d12 + Fear d12",
    stat,
    situational: relevant,
    total: stat.total + situationalTotal,
  }
}

/** "duality+2", "duality-1", "duality" — o modificador já no texto. */
const dualityWith = (modifier: number): string =>
  modifier === 0 ? "duality" : `duality${modifier > 0 ? "+" : "-"}${Math.abs(modifier)}`

/** Rolar um atributo: Duality com o valor final dele. */
export const presetForTrait = (trait: Trait, derived: DerivedStats): DicePreset => ({
  label: trait,
  expression: dualityWith(derived.traits[trait].total),
})

/**
 * Atacar e causar dano com uma arma empunhada.
 *
 * O ataque usa o atributo da arma — `Forcewield` é o da subclasse, e sem ele
 * soma zero. O dano leva a Proficiency no número de dados e o bônus do tier,
 * como `formatWeaponDamage` mostra. Os bônus de augment entram nos dois.
 */
export const presetsForWeapon = (
  weapon: Weapon,
  name: string,
  derived: DerivedStats,
  bonuses: { attackBonus: number; damageBonus: number },
): { attack: DicePreset; damage: DicePreset } => {
  const trait = weapon.trait === "Forcewield" ? derived.spellcastTrait : weapon.trait
  const traitValue = trait ? derived.traits[trait].total : 0
  const damageBonus = (weapon.bonusByTier[derived.tier - 1] ?? 0) + bonuses.damageBonus
  const bonusText = damageBonus === 0 ? "" : `${damageBonus > 0 ? "+" : "-"}${Math.abs(damageBonus)}`

  return {
    attack: {
      label: `Ataque · ${name}`,
      expression: dualityWith(traitValue + bonuses.attackBonus),
    },
    damage: {
      label: `Dano · ${name}`,
      expression: `${derived.proficiency.total}${weapon.damageDie}${bonusText}`,
    },
  }
}
