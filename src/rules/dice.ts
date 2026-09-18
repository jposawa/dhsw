import type { DieRole, DualityOutcome, RolledDie, RollResult } from "@/types"

/**
 * Rolagem de dados. Pura: o sorteio entra por parâmetro, e os testes passam
 * uma sequência fixa.
 *
 * Uma rolagem é uma expressão só — um **pool** de termos somados ou
 * subtraídos: `duality+2-1d6`, `2d8+3`. `duality` são os Duality Dice, Hope
 * d12 + Fear d12. Com eles no pool, um d6 somado é o dado de vantagem e um
 * subtraído, o de desvantagem (Core Rulebook, p. 100); os dois d12 iguais são
 * crítico, que conta como Hope mesmo com total baixo (p. 90).
 *
 * Atalho de ficha não rola: prepara a expressão, e quem rola ainda pode somar
 * e tirar dados antes.
 */

/** Sorteia um valor de 1 a `sides`. */
export type RandomDie = (sides: number) => number

const UINT32_RANGE = 2 ** 32

/**
 * Sorteio pelo `crypto` do navegador, sem viés: um valor de 32 bits só vale se
 * cair numa faixa múltipla de `sides`, senão sorteia de novo. `% sides` direto
 * favoreceria os números baixos.
 */
export const cryptoDie: RandomDie = (sides) => {
  const limit = UINT32_RANGE - (UINT32_RANGE % sides)
  const buffer = new Uint32Array(1)

  for (;;) {
    crypto.getRandomValues(buffer)

    if (buffer[0] < limit) {
      return (buffer[0] % sides) + 1
    }
  }
}

export const DUALITY_TOKEN = "duality"

const MAX_DICE_PER_GROUP = 100
const MAX_SIDES = 1000

export type DiceGroup = {
  count: number
  sides: number
  /** `-1` é dado subtraído — a desvantagem, por exemplo. */
  sign: 1 | -1
}

export type DicePool = {
  hasDuality: boolean
  groups: readonly DiceGroup[]
  modifier: number
}

export const EMPTY_POOL: DicePool = { hasDuality: false, groups: [], modifier: 0 }

const TERM = /([+-]?)(duality|\d*d\d+|\d+)/g
const WHOLE = /^[+-]?(duality|\d*d\d+|\d+)([+-](duality|\d*d\d+|\d+))*$/

/**
 * Texto → pool. Grupos de mesmo dado e mesmo sinal se juntam. `null` para
 * texto que não é expressão, `duality` subtraído ou repetido, ou dado absurdo
 * (menos de 2 faces, mais de cem de uma vez).
 */
export const parseDicePool = (text: string): DicePool | null => {
  const compact = text.replace(/\s+/g, "").toLowerCase()

  if (!compact || !WHOLE.test(compact)) {
    return null
  }

  const groups: DiceGroup[] = []
  let hasDuality = false
  let modifier = 0

  for (const [, signText, term] of compact.matchAll(TERM)) {
    const sign = signText === "-" ? -1 : 1

    if (term === DUALITY_TOKEN) {
      if (sign < 0 || hasDuality) {
        return null
      }

      hasDuality = true
      continue
    }

    const die = /^(\d*)d(\d+)$/.exec(term)

    if (!die) {
      modifier += sign * Number(term)
      continue
    }

    const count = die[1] === "" ? 1 : Number(die[1])
    const sides = Number(die[2])
    const same = groups.find((group) => group.sides === sides && group.sign === sign)

    if (count < 1 || sides < 2 || sides > MAX_SIDES) {
      return null
    }

    if (same) {
      same.count += count
    } else {
      groups.push({ count, sides, sign })
    }
  }

  if (groups.some((group) => group.count > MAX_DICE_PER_GROUP)) {
    return null
  }

  return hasDuality || groups.length > 0 ? { hasDuality, groups, modifier } : null
}

/** Pool → texto canônico: `duality+2d6-1d6+3`. Vazio para pool vazio. */
export const formatDicePool = ({ hasDuality, groups, modifier }: DicePool): string => {
  const terms = [
    ...(hasDuality ? [DUALITY_TOKEN] : []),
    ...groups.map(({ count, sides, sign }) => `${sign < 0 ? "-" : "+"}${count}d${sides}`),
    ...(modifier === 0 ? [] : [`${modifier < 0 ? "-" : "+"}${Math.abs(modifier)}`]),
  ]

  return terms.join("").replace(/^\+/, "")
}

/**
 * Dá para rolar este pool?
 *
 * Duas coisas que não são rolagem e que a tela não deve deixar montar:
 *
 * - **pool sem dado** — um modificador sozinho é uma conta, não uma rolagem, e
 *   o resultado seria o número que já estava na tela;
 * - **pool só de dados subtraídos** — tirar d6 é ajuste de uma rolagem, e sem
 *   nada de onde tirar ele vira um total negativo sem sentido.
 *
 * Mora aqui, e não no componente: os dois roladores fazem a mesma pergunta, e
 * respondida em cada um ela divergiria no primeiro ajuste.
 */
export const canRollPool = ({ hasDuality, groups }: DicePool): boolean =>
  hasDuality || groups.some((group) => group.sign > 0)

/** Soma (ou tira) um dado do pool, juntando ao grupo de mesmas faces e sinal. */
export const addDieToPool = (pool: DicePool, sides: number, sign: 1 | -1): DicePool => {
  const same = pool.groups.some((group) => group.sides === sides && group.sign === sign)

  return {
    ...pool,
    groups: same
      ? pool.groups.map((group) =>
          group.sides === sides && group.sign === sign ? { ...group, count: group.count + 1 } : group,
        )
      : [...pool.groups, { count: 1, sides, sign }],
  }
}

/**
 * Tira **um** dado do grupo de mesmas faces e sinal; o grupo some ao zerar.
 *
 * Um por vez e não o grupo inteiro: cada dado preparado é um ícone com o seu
 * ×, e um × que leva os outros três junto não é o que o ícone promete.
 */
export const removeDieFromPool = (pool: DicePool, sides: number, sign: 1 | -1): DicePool => ({
  ...pool,
  groups: pool.groups
    .map((group) =>
      group.sides === sides && group.sign === sign ? { ...group, count: group.count - 1 } : group,
    )
    .filter((group) => group.count > 0),
})

/** Com os Duality Dice no pool, o d6 é vantagem ou desvantagem; sem eles, dado comum. */
const roleOf = (group: DiceGroup, hasDuality: boolean): DieRole => {
  if (!hasDuality || group.sides !== 6) {
    return "plain"
  }

  return group.sign > 0 ? "advantage" : "disadvantage"
}

const outcomeOf = (hope: number, fear: number): DualityOutcome => {
  if (hope > fear) {
    return "hope"
  }

  return fear > hope ? "fear" : "critical"
}

/** Rola a expressão. `null` quando o texto não é expressão. */
export const rollPool = (text: string, label: string, random: RandomDie): RollResult | null => {
  const pool = parseDicePool(text)

  return pool && rollDicePool(pool, label, random)
}

/**
 * Rola o pool montado.
 *
 * É esta que a tela usa: com os dados montados por ícone, não há texto para
 * reanalisar, e passar por `formatDicePool` só para `parseDicePool` desfazer
 * seria ida e volta por um parser que ninguém pediu. `rollPool` continua para
 * quem chega com expressão — a rolagem preparada que vem da ficha.
 */
export const rollDicePool = (pool: DicePool, label: string, random: RandomDie): RollResult => {
  const duality: RolledDie[] = pool.hasDuality
    ? [
        { sides: 12, value: random(12), role: "hope" },
        { sides: 12, value: random(12), role: "fear" },
      ]
    : []

  const rolled = pool.groups.flatMap((group) =>
    Array.from({ length: group.count }, () => ({
      die: { sides: group.sides, value: random(group.sides), role: roleOf(group, pool.hasDuality) },
      sign: group.sign,
    })),
  )

  const total =
    duality.reduce((sum, die) => sum + die.value, 0) +
    rolled.reduce((sum, { die, sign }) => sum + sign * die.value, 0) +
    pool.modifier

  return {
    kind: pool.hasDuality ? "duality" : "dice",
    label,
    expression: formatDicePool(pool),
    dice: [...duality, ...rolled.map(({ die, sign }) => (sign < 0 ? { ...die, isSubtracted: true } : die))],
    modifier: pool.modifier,
    total,
    outcome: pool.hasDuality ? outcomeOf(duality[0].value, duality[1].value) : null,
  }
}

const OUTCOME_TEXT: Readonly<Record<DualityOutcome, string>> = {
  hope: "com Hope",
  fear: "com Fear",
  critical: "crítico",
}

/** O resultado numa linha, para o histórico: "Agility · 17 com Hope". */
export const describeRoll = (result: RollResult): string => {
  const subject = result.label || result.expression
  const outcome = result.outcome ? ` ${OUTCOME_TEXT[result.outcome]}` : ""

  return `${subject} · ${result.total}${outcome}`
}
