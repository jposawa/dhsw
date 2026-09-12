/** "1d4" → { count: 1, sides: 4 }. Texto fora do formato vira um d1, que não quebra conta. */
export const parseDice = (dice: string): { count: number; sides: number } => {
  const match = /^(\d+)d(\d+)$/.exec(dice.trim())

  if (!match) {
    return { count: 1, sides: 1 }
  }

  return { count: Number(match[1]), sides: Number(match[2]) }
}
