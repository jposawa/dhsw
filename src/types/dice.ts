/** O papel de um dado numa rolagem. `plain` é dado de dano ou livre. */
export type DieRole = "hope" | "fear" | "advantage" | "disadvantage" | "plain"

export type RolledDie = {
  sides: number
  value: number
  role: DieRole
  /** Dado que tira do total. Ausente é somado. */
  isSubtracted?: boolean
}

/** Resultado de uma rolagem de Duality. Crítico é quando os dois d12 empatam. */
export type DualityOutcome = "hope" | "fear" | "critical"

export type RollKind = "duality" | "dice"

export type RollResult = {
  kind: RollKind
  /** O que se rolou: "Agility", "Dano · Blaster Pistol". Vazio é rolagem solta. */
  label: string
  /** A expressão rolada, canônica: "2d8+3", "duality+2-1d6". */
  expression: string
  dice: readonly RolledDie[]
  modifier: number
  total: number
  outcome: DualityOutcome | null
}

/** Quem rolou, numa mesa. */
export type RollAuthor = {
  userId: string
  name: string
}

/**
 * Onde a rolagem é vista. `gm` é a rolagem que o Narrador guardou para si;
 * jogador rola sempre em `public`.
 */
export type RollVisibility = "public" | "gm"

/** Uma rolagem guardada — no histórico local ou no da mesa. */
export type RollRecord = RollResult & {
  id: string
  createdAt: number
  author: RollAuthor | null
  /** A ficha de onde a rolagem saiu, quando saiu de uma. */
  sheet: { id: string; name: string } | null
  visibility: RollVisibility
}

/**
 * Uma rolagem preparada, vinda da ficha: um atributo (`duality+2`), o dano
 * de uma arma (`2d8+3`). Não rola — enche o rolador, e quem rola ajusta.
 */
export type DicePreset = {
  label: string
  expression: string
}
