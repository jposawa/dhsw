import type { RollAuthor, RollRecord, RollResult, RollVisibility } from "@/types"

type RollContext = {
  author?: RollAuthor | null
  sheet?: { id: string; name: string } | null
  visibility?: RollVisibility
}

/** Uma rolagem pronta para guardar. O id é local; na mesa, o banco dá outro. */
export const createRollRecord = (result: RollResult, context: RollContext = {}): RollRecord => ({
  ...result,
  id: crypto.randomUUID(),
  createdAt: Date.now(),
  author: context.author ?? null,
  sheet: context.sheet ?? null,
  visibility: context.visibility ?? "public",
})

/** Põe a rolagem no topo e corta o que passar do limite — a mais antiga sai. */
export const addToHistory = (
  history: readonly RollRecord[],
  record: RollRecord,
  limit: number,
): RollRecord[] => [record, ...history].slice(0, limit)

/**
 * As rolagens que sobram além do limite, das mais antigas: são as que a
 * limpeza da mesa apaga. Recebe as rolagens em qualquer ordem.
 */
export const overflowingRolls = <TRoll extends { createdAt: number }>(
  rolls: readonly TRoll[],
  limit: number,
): TRoll[] => {
  const newestFirst = [...rolls].sort((left, right) => right.createdAt - left.createdAt)

  return newestFirst.slice(limit)
}

const listOf = <TItem>(stored: unknown): TItem[] => {
  if (Array.isArray(stored)) {
    return stored.filter((item) => item !== null && item !== undefined) as TItem[]
  }

  return stored && typeof stored === "object" ? (Object.values(stored) as TItem[]) : []
}

/** Uma rolagem vazia: o molde do que o banco apaga (os `null` e o zero). */
const BLANK_ROLL: Omit<RollRecord, "id"> = {
  createdAt: 0,
  kind: "dice",
  label: "",
  expression: "",
  dice: [],
  modifier: 0,
  total: 0,
  outcome: null,
  author: null,
  sheet: null,
  visibility: "public",
}

/**
 * Uma rolagem como o banco devolve: sem os `null` e sem o que é zero, e com os
 * dados vindo como objeto quando a lista tem buraco. O id é a chave do nó.
 */
export const normalizeRollRecord = (id: string, stored: Partial<RollRecord>): RollRecord => ({
  ...BLANK_ROLL,
  ...stored,
  id,
  dice: listOf(stored.dice),
})
