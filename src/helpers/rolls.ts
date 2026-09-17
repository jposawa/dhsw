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

/**
 * Uma rolagem como o banco devolve: sem os `null` (autor, ficha, resultado de
 * dados soltos) e com os dados como objeto quando a lista tem buraco. O id é a
 * chave do nó.
 */
export const normalizeRollRecord = (id: string, stored: Partial<RollRecord>): RollRecord => ({
  id,
  createdAt: stored.createdAt ?? 0,
  kind: stored.kind ?? "dice",
  label: stored.label ?? "",
  expression: stored.expression ?? "",
  dice: listOf(stored.dice),
  modifier: stored.modifier ?? 0,
  total: stored.total ?? 0,
  outcome: stored.outcome ?? null,
  author: stored.author ?? null,
  sheet: stored.sheet ?? null,
  visibility: stored.visibility ?? "public",
})
