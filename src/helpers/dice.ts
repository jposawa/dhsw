import { DIE_SIDES, DUALITY_SIDES } from "@/constants"
import type {
  DiceGroup,
  DicePool,
  DualityDie,
  DieRole,
  DualityOutcome,
  RandomDie,
  RolledDie,
  RollResult,
} from "@/types"

/*
 * Dados: o pool de uma rolagem e a leitura de um dado escrito à mão.
 *
 * Os dois moravam em arquivos separados com o mesmo nome, um em `rules/` e
 * outro aqui, e a divisão entre as duas pastas nunca teve critério escrito que
 * o código seguisse. São o mesmo assunto.
 */

/**
 * Rolagem de dados. Pura: o sorteio entra por parâmetro, e os testes passam
 * uma sequência fixa.
 *
 * Uma rolagem é uma expressão só — um **pool** de termos somados ou
 * subtraídos: `duality+2-1d6`, `2d8+3`. `duality` são os Duality Dice, Hope
 * d12 + Fear d12. Com eles no pool, um d6 somado é o dado de vantagem e um
 * subtraído, o de desvantagem (Core Rulebook, p. 100); os dois dados de
 * dualidade empatados são crítico, que conta como Hope mesmo com total baixo
 * (p. 90) — inclusive quando uma feature trocou o dado de um dos lados.
 *
 * Atalho de ficha não rola: prepara a expressão, e quem rola ainda pode somar
 * e tirar dados antes.
 */

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

export const EMPTY_POOL: DicePool = {
  hope: 0,
  fear: 0,
  hopeSides: DUALITY_SIDES,
  fearSides: DUALITY_SIDES,
  groups: [],
  modifier: 0,
}

/** Quantos d12 de Hope ou de Fear cabem numa rolagem. */
const MAX_DUALITY_DICE = 9

/**
 * `duality`, `2hope`, `d20fear`, `2d20hope`.
 *
 * O `d<faces>` opcional é o dado trocado por feature — o Dedicated do
 * Orderborne rola d20 como Hope. Sem ele vale o d12 do livro.
 */
const DUALITY_TERM = "(duality|[0-9]*(?:d[0-9]+)?hope|[0-9]*(?:d[0-9]+)?fear)"
const DIE_TERM = "[0-9]*d[0-9]+|[0-9]+"
const TERM = new RegExp(`([+-]?)(${DUALITY_TERM}|${DIE_TERM})`, "g")
const WHOLE = new RegExp(
  `^[+-]?(${DUALITY_TERM}|${DIE_TERM})([+-](${DUALITY_TERM}|${DIE_TERM}))*$`,
)

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
  let hope = 0
  let fear = 0
  // `null` é "a expressão não disse": no fim vale o d12 do livro.
  let hopeSides: number | null = null
  let fearSides: number | null = null
  let modifier = 0

  for (const [, signText, term] of compact.matchAll(TERM)) {
    const sign = signText === "-" ? -1 : 1

    if (term === DUALITY_TOKEN) {
      if (sign < 0) {
        return null
      }

      hope += 1
      fear += 1
      continue
    }

    // `2hope`, `fear`, `d20hope`: o lado avulso, para quando a mesa pede um
    // só — e o dado trocado, quando uma feature troca.
    const duality = /^([0-9]*)(?:d([0-9]+))?(hope|fear)$/.exec(term)

    if (duality) {
      const count = duality[1] === "" ? 1 : Number(duality[1])
      const sides = duality[2] === undefined ? null : Number(duality[2])
      const isHope = duality[3] === "hope"

      if (sign < 0 || count < 1) {
        return null
      }

      if (sides !== null && (sides < 2 || sides > MAX_SIDES)) {
        return null
      }

      // Duas medidas para o mesmo lado não são um pool: o lado tem um dado só.
      const declared: number | null = isHope ? hopeSides : fearSides

      if (sides !== null && declared !== null && declared !== sides) {
        return null
      }

      if (isHope) {
        hope += count
        hopeSides = sides ?? hopeSides
      } else {
        fear += count
        fearSides = sides ?? fearSides
      }

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

  if (hope > MAX_DUALITY_DICE || fear > MAX_DUALITY_DICE) {
    return null
  }

  if (hope === 0 && fear === 0 && groups.length === 0) {
    return null
  }

  return {
    hope,
    fear,
    hopeSides: hopeSides ?? DUALITY_SIDES,
    fearSides: fearSides ?? DUALITY_SIDES,
    groups,
    modifier,
  }
}

/** `1hope`, `2d20fear` — o `d<faces>` só aparece quando não é o d12 do livro. */
const dualityTerm = (count: number, sides: number, die: DualityDie): string =>
  `${count}${sides === DUALITY_SIDES ? "" : `d${sides}`}${die}`

/**
 * Pool → texto canônico: `duality+2d6-1d6+3`. Vazio para pool vazio.
 *
 * O par de 1 e 1 **nos dados do livro** sai como `duality` e não como
 * `1hope+1fear`: é o nome que a regra dá ao par, é o que o histórico já
 * guardou, e `parseDicePool` lê os dois de volta. Com o dado trocado o par
 * deixa de ser o do livro, e cada lado se escreve — `1d20hope+1fear`.
 */
export const formatDicePool = ({
  hope,
  fear,
  hopeSides,
  fearSides,
  groups,
  modifier,
}: DicePool): string => {
  const isBookPair =
    hope === 1 && fear === 1 && hopeSides === DUALITY_SIDES && fearSides === DUALITY_SIDES

  const duality = isBookPair
    ? [DUALITY_TOKEN]
    : [
        ...(hope > 0 ? [dualityTerm(hope, hopeSides, "hope")] : []),
        ...(fear > 0 ? [`+${dualityTerm(fear, fearSides, "fear")}`] : []),
      ]

  const terms = [
    ...duality,
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
export const canRollPool = ({ hope, fear, groups }: DicePool): boolean =>
  hope > 0 || fear > 0 || groups.some((group) => group.sign > 0)

/**
 * Troca o dado de um dos lados — o d20 de Hope do Dedicated, o dado menor de
 * Fear que outra feature imponha.
 *
 * O lado inteiro muda, e não um dado dele: uma dualidade com dois Hopes de
 * medidas diferentes não é uma rolagem que o livro descreva.
 */
export const setDualitySides = (pool: DicePool, die: DualityDie, sides: number): DicePool =>
  die === "hope" ? { ...pool, hopeSides: sides } : { ...pool, fearSides: sides }

/** O próximo dado da escada, dando a volta no fim. Fora dela, começa do menor. */
export const nextDieSides = (sides: number): number => {
  const index = DIE_SIDES.findIndex((candidate) => candidate === sides)

  return index < 0 ? DIE_SIDES[0] : DIE_SIDES[(index + 1) % DIE_SIDES.length]
}

/**
 * Soma um dado de Hope ou de Fear. O teto mora aqui e não na tela: os dois
 * roladores somam pelo mesmo caminho.
 */
export const addDualityDie = (pool: DicePool, die: DualityDie): DicePool => ({
  ...pool,
  [die]: Math.min(pool[die] + 1, MAX_DUALITY_DICE),
})

/** Tira um dado de Hope ou de Fear. Nunca abaixo de zero. */
export const removeDualityDie = (pool: DicePool, die: DualityDie): DicePool => ({
  ...pool,
  [die]: Math.max(pool[die] - 1, 0),
})

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

/** Com d12 de dualidade no pool, o d6 é vantagem ou desvantagem; sem eles, dado comum. */
const roleOf = (group: DiceGroup, hasDuality: boolean): DieRole => {
  if (!hasDuality || group.sides !== 6) {
    return "plain"
  }

  return group.sign > 0 ? "advantage" : "disadvantage"
}

/**
 * Hope ou Fear — o **maior** de cada lado, e não a soma.
 *
 * Com um de cada, que é a dualidade do livro (p. 90), maior e soma dizem a
 * mesma coisa. Fora disso o livro não fala, e somar faria dois d12 de Hope
 * ganharem de um de Fear quase sempre: acrescentar um dado viraria vencer, em
 * vez de melhorar a chance. Pelo maior, o empate continua sendo crítico.
 *
 * Um lado sozinho vence por não ter adversário — zero.
 */
const outcomeOf = (hope: readonly number[], fear: readonly number[]): DualityOutcome => {
  const maiorHope = Math.max(0, ...hope)
  const maiorFear = Math.max(0, ...fear)

  if (maiorHope > maiorFear) {
    return "hope"
  }

  return maiorFear > maiorHope ? "fear" : "critical"
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
  const hasDuality = pool.hope > 0 || pool.fear > 0

  // Hope antes de Fear, e os dois antes do resto: é a ordem em que o resultado
  // se lê, e é a mesma da ficha.
  const hopeDice: RolledDie[] = Array.from({ length: pool.hope }, () => ({
    sides: pool.hopeSides,
    value: random(pool.hopeSides),
    role: "hope",
  }))

  const fearDice: RolledDie[] = Array.from({ length: pool.fear }, () => ({
    sides: pool.fearSides,
    value: random(pool.fearSides),
    role: "fear",
  }))

  const duality = [...hopeDice, ...fearDice]

  const rolled = pool.groups.flatMap((group) =>
    Array.from({ length: group.count }, () => ({
      die: { sides: group.sides, value: random(group.sides), role: roleOf(group, hasDuality) },
      sign: group.sign,
    })),
  )

  const total =
    duality.reduce((sum, die) => sum + die.value, 0) +
    rolled.reduce((sum, { die, sign }) => sum + sign * die.value, 0) +
    pool.modifier

  return {
    kind: hasDuality ? "duality" : "dice",
    label,
    expression: formatDicePool(pool),
    dice: [...duality, ...rolled.map(({ die, sign }) => (sign < 0 ? { ...die, isSubtracted: true } : die))],
    modifier: pool.modifier,
    total,
    outcome: hasDuality
      ? outcomeOf(
          hopeDice.map((die) => die.value),
          fearDice.map((die) => die.value),
        )
      : null,
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

/** "1d4" → { count: 1, sides: 4 }. Texto fora do formato vira um d1, que não quebra conta. */
export const parseDice = (dice: string): { count: number; sides: number } => {
  const match = /^(\d+)d(\d+)$/.exec(dice.trim())

  if (!match) {
    return { count: 1, sides: 1 }
  }

  return { count: Number(match[1]), sides: Number(match[2]) }
}
