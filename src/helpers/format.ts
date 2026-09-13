import type { DerivedStats, Modifier, Weapon } from "@/types"

/** Sinal explicito: "+2" e "−1" leem melhor que "2" e "-1". */
export const formatSigned = (value: number): string => {
  if (value < 0) {
    return `−${Math.abs(value)}`
  }

  return `+${value}`
}

/** Rotulo em pt-br da origem de um modificador, para o detalhamento na UI. */
export const describeModifierSource = ({ source }: Modifier): string => {
  switch (source.kind) {
    case "base":
      return "base"
    case "armor":
    case "weapon":
      return source.feature ? `${source.name} — ${source.feature}` : source.name
    case "class":
    case "item":
    case "skill":
      return source.name
    case "subclass":
    case "ancestry":
    case "community":
      return `${source.name} — ${source.feature}`
    case "advancement":
      return `advancement, nível ${source.level}`
    case "level":
      return source.multiplier === 1 ? `nível ${source.level}` : `${source.multiplier} × nível ${source.level}`
    case "levelAchievement":
      return `level achievement, nível ${source.level}`
    case "module":
      return source.moduleName
    case "houseRule":
      return `regra da casa — ${source.rule}`
    case "situational":
      return source.label
  }
}

/**
 * Mensagem legível de um erro qualquer.
 *
 * O SDK do Firebase joga `Error` com texto útil (`PERMISSION_DENIED: ...`), e
 * é exatamente esse texto que separa "a regra recusou" de "a rede caiu". Sem
 * ele, os dois viram a mesma tela e você conserta o lado errado.
 */
export const describeError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === "string") {
    return error
  }

  return "Erro desconhecido"
}

/**
 * Dados de dano como a ficha do livro escreve: Proficiency já no número de
 * dados, bônus do tier depois — `2d8+3 phy`. Bônus zero não aparece.
 */
export const formatWeaponDamage = (weapon: Weapon, proficiency: number, tierIndex: number): string => {
  const bonus = weapon.bonusByTier[tierIndex] ?? 0
  const bonusText = bonus === 0 ? "" : formatSigned(bonus).replace("−", "-")

  return `${proficiency}${weapon.damageDie}${bonusText} ${weapon.damageType}`
}

/**
 * De onde saíram os dois thresholds, numa linha.
 *
 * É a resposta a "por que meu Major é 1?" sem abrir detalhamento: sem armadura
 * é o nível, com armadura é a base dela mais o nível.
 */
export const describeThresholdOrigin = (derived: DerivedStats): string => {
  const major = derived.majorThreshold.base
  const severe = derived.severeThreshold.base

  if (derived.equippedArmor) {
    return `${derived.equippedArmor.name} ${major}/${severe} + nível ${derived.level}`
  }

  if (derived.hasBareBones) {
    return `Bare Bones, Tier ${derived.tier}: ${major}/${severe} + nível ${derived.level}`
  }

  return "Sem armadura: Major = nível, Severe = 2 × nível"
}
