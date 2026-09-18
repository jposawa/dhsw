import { describe, expect, it } from "vitest"

import {
  addDieToPool,
  canRollPool,
  cryptoDie,
  describeRoll,
  EMPTY_POOL,
  formatDicePool,
  parseDicePool,
  type RandomDie,
  removeDieFromPool,
  rollDicePool,
  rollPool,
} from "./dice"

/** Devolve os valores na ordem pedida, um por dado sorteado. */
const sequence = (...values: number[]): RandomDie => {
  let index = 0

  return () => values[index++] ?? 1
}

describe("parseDicePool", () => {
  it("lê dados e modificador, com ou sem espaço", () => {
    expect(parseDicePool("2d8+3")).toEqual({
      hasDuality: false,
      groups: [{ count: 2, sides: 8, sign: 1 }],
      modifier: 3,
    })
    expect(parseDicePool(" d20 ")?.groups).toEqual([{ count: 1, sides: 20, sign: 1 }])
  })

  it("lê duality e dado subtraído", () => {
    expect(parseDicePool("Duality + 2 - 1d6")).toEqual({
      hasDuality: true,
      groups: [{ count: 1, sides: 6, sign: -1 }],
      modifier: 2,
    })
  })

  it("junta dados iguais de mesmo sinal", () => {
    expect(parseDicePool("1d6+1d6-1d6")?.groups).toEqual([
      { count: 2, sides: 6, sign: 1 },
      { count: 1, sides: 6, sign: -1 },
    ])
  })

  it("recusa o que não é rolagem", () => {
    expect(parseDicePool("")).toBeNull()
    expect(parseDicePool("3")).toBeNull()
    expect(parseDicePool("2x6")).toBeNull()
    expect(parseDicePool("1d1")).toBeNull()
    expect(parseDicePool("-duality")).toBeNull()
    expect(parseDicePool("duality+duality")).toBeNull()
    expect(parseDicePool("500d6")).toBeNull()
  })
})

describe("formatDicePool e addDieToPool", () => {
  it("escreve na forma canônica", () => {
    expect(formatDicePool({ hasDuality: true, groups: [{ count: 1, sides: 6, sign: -1 }], modifier: 2 })).toBe(
      "duality-1d6+2",
    )
    expect(formatDicePool({ hasDuality: false, groups: [{ count: 2, sides: 8, sign: 1 }], modifier: -1 })).toBe(
      "2d8-1",
    )
    expect(formatDicePool(EMPTY_POOL)).toBe("")
  })

  it("somar um dado igual aumenta o grupo; de sinal diferente, abre outro", () => {
    const once = addDieToPool(EMPTY_POOL, 6, 1)
    const twice = addDieToPool(once, 6, 1)
    const minus = addDieToPool(twice, 6, -1)

    expect(formatDicePool(minus)).toBe("2d6-1d6")
  })
})

describe("removeDieFromPool", () => {
  /* Um por vez: cada dado preparado é um ícone com o seu ×, e um × que leva os
     outros do mesmo tipo junto não é o que o ícone promete. */
  it("tira um dado do grupo, e o grupo some ao zerar", () => {
    const três = addDieToPool(addDieToPool(addDieToPool(EMPTY_POOL, 6, 1), 6, 1), 6, 1)

    expect(formatDicePool(removeDieFromPool(três, 6, 1))).toBe("2d6")
    expect(
      formatDicePool(removeDieFromPool(removeDieFromPool(removeDieFromPool(três, 6, 1), 6, 1), 6, 1)),
    ).toBe("")
  })

  it("o sinal faz parte da identidade: tirar somado não mexe no subtraído", () => {
    const misto = addDieToPool(addDieToPool(EMPTY_POOL, 6, 1), 6, -1)

    expect(formatDicePool(removeDieFromPool(misto, 6, 1))).toBe("-1d6")
  })

  it("tirar dado que não está no pool não muda nada", () => {
    expect(removeDieFromPool(EMPTY_POOL, 20, 1)).toEqual(EMPTY_POOL)
  })
})

describe("canRollPool", () => {
  it("dado somado, ou Duality, é rolagem", () => {
    expect(canRollPool(addDieToPool(EMPTY_POOL, 8, 1))).toBe(true)
    expect(canRollPool({ ...EMPTY_POOL, hasDuality: true })).toBe(true)
  })

  /* Um modificador sozinho é uma conta, não uma rolagem: o resultado seria o
     número que já estava na tela. */
  it("modificador sem dado não é rolagem", () => {
    expect(canRollPool({ ...EMPTY_POOL, modifier: 3 })).toBe(false)
    expect(canRollPool(EMPTY_POOL)).toBe(false)
  })

  /* Tirar d6 é ajuste de uma rolagem; sem nada de onde tirar, vira um total
     negativo sem sentido. */
  it("só dados subtraídos não é rolagem", () => {
    expect(canRollPool(addDieToPool(EMPTY_POOL, 6, -1))).toBe(false)
    expect(canRollPool(addDieToPool({ ...EMPTY_POOL, hasDuality: true }, 6, -1))).toBe(true)
  })
})

describe("rollDicePool", () => {
  /* A tela rola o pool montado sem passar por texto. O resultado tem que ser o
     mesmo que a expressão equivalente dá — senão são dois roladores. */
  it("dá o mesmo que rolar a expressão equivalente", () => {
    const pool = addDieToPool(addDieToPool(EMPTY_POOL, 8, 1), 8, 1)

    expect(rollDicePool({ ...pool, modifier: 3 }, "Dano", sequence(5, 7))).toEqual(
      rollPool("2d8+3", "Dano", sequence(5, 7)),
    )
  })
})

describe("rollPool", () => {
  it("dados soltos: soma e sem resultado de Hope/Fear", () => {
    const result = rollPool("2d8+3", "Dano", sequence(5, 7))

    expect(result?.total).toBe(15)
    expect(result?.kind).toBe("dice")
    expect(result?.outcome).toBeNull()
  })

  it("dado subtraído tira do total", () => {
    const result = rollPool("1d8-1d4", "", sequence(6, 3))

    expect(result?.total).toBe(3)
    expect(result?.dice[1]).toEqual({ sides: 4, value: 3, role: "plain", isSubtracted: true })
  })

  it("devolve null para expressão inválida", () => {
    expect(rollPool("banana", "", sequence())).toBeNull()
  })
})

describe("rollPool com Duality (p. 90 e 100)", () => {
  it("Hope maior é rolagem com Hope", () => {
    const result = rollPool("duality+2", "Agility", sequence(9, 4))

    expect(result?.total).toBe(15)
    expect(result?.outcome).toBe("hope")
    expect(result?.dice.map((die) => die.role)).toEqual(["hope", "fear"])
  })

  it("Fear maior é rolagem com Fear", () => {
    expect(rollPool("duality", "", sequence(3, 10))?.outcome).toBe("fear")
  })

  it("d12 iguais são crítico, qualquer que seja o total", () => {
    const result = rollPool("duality-3", "", sequence(1, 1))

    expect(result?.outcome).toBe("critical")
    expect(result?.total).toBe(-1)
  })

  it("com Duality, +d6 é vantagem e −d6 é desvantagem", () => {
    const advantage = rollPool("duality+1d6", "", sequence(6, 5, 4))
    const disadvantage = rollPool("duality-1d6", "", sequence(6, 5, 4))

    expect(advantage?.total).toBe(15)
    expect(advantage?.dice[2].role).toBe("advantage")
    expect(disadvantage?.total).toBe(7)
    expect(disadvantage?.dice[2]).toEqual({ sides: 6, value: 4, role: "disadvantage", isSubtracted: true })
  })

  it("sem Duality, o d6 é dado comum", () => {
    expect(rollPool("1d6", "", sequence(4))?.dice[0].role).toBe("plain")
  })
})

describe("describeRoll", () => {
  it("diz o nome, o total e o resultado", () => {
    const result = rollPool("duality+2", "Agility", sequence(9, 4))

    expect(result && describeRoll(result)).toBe("Agility · 15 com Hope")
  })

  it("rolagem sem nome usa a expressão", () => {
    const result = rollPool("1d20", "", sequence(12))

    expect(result && describeRoll(result)).toBe("1d20 · 12")
  })
})

describe("cryptoDie", () => {
  it("fica sempre entre 1 e o número de faces", () => {
    const values = Array.from({ length: 2000 }, () => cryptoDie(6))

    expect(Math.min(...values)).toBe(1)
    expect(Math.max(...values)).toBe(6)
  })
})
