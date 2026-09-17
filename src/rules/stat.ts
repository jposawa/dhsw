import type { Modifier, ResolvedStat, StatKey } from "@/types"

/**
 * Montagem de característica: base + modificadores → total.
 *
 * Todo número visível na ficha passa por aqui. O motivo de não devolver
 * só o total: a UI precisa mostrar de onde veio cada ponto. "Evasion 12"
 * sem o detalhe vira número mágico que ninguém confere na mesa.
 */

export const resolveStat = (
  base: number,
  modifiers: readonly Modifier[],
): ResolvedStat => {
  const total = modifiers.reduce(
    (runningTotal, modifier) => runningTotal + modifier.value,
    base,
  )

  return { base, modifiers, total }
}

/**
 * Trava o total entre 0 e o teto da regra — Armor Score 12, Proficiency 6.
 * Base e modificadores continuam inteiros, para a UI mostrar a soma real.
 */
export const clampStat = (stat: ResolvedStat, max: number): ResolvedStat => ({
  ...stat,
  total: Math.min(max, Math.max(0, stat.total)),
})

/** Coletor: acumula modificadores por alvo enquanto `derive` varre as fontes. */
export type ModifierCollector = {
  add: (modifier: Modifier) => void
  for: (target: StatKey) => readonly Modifier[]
  all: () => readonly Modifier[]
}

export const createModifierCollector = (): ModifierCollector => {
  const collected: Modifier[] = []

  return {
    add: (modifier) => {
      // Modificador de valor zero é ruído na explicação: "Neutra: +0" não
      // ajuda ninguém. Fonte sem efeito não entra na lista.
      if (modifier.value === 0) {
        return
      }

      collected.push(modifier)
    },
    for: (target) => collected.filter((modifier) => modifier.target === target),
    all: () => collected,
  }
}

/** Soma dos modificadores de um alvo — usado onde só o número importa. */
export const sumModifiers = (
  modifiers: readonly Modifier[],
  target: StatKey,
): number =>
  modifiers
    .filter((modifier) => modifier.target === target)
    .reduce((runningTotal, modifier) => runningTotal + modifier.value, 0)
