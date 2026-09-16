import { COMPENDIUM_COLLECTIONS, COMPENDIUM_SCHEMAS } from "@/compendium"
import type { Compendium, CompendiumCollection, CompendiumOrigin } from "@/types"

/**
 * O Realtime Database devolve lista como array quando as chaves são 0..n, e
 * como objeto quando são nomes ou têm buraco. Os dois formatos valem: quem
 * edita pelo console do Firebase costuma chavear por nome.
 */
const toList = (stored: unknown): unknown => {
  if (stored && typeof stored === "object" && !Array.isArray(stored)) {
    return Object.values(stored)
  }

  return stored
}

const isIndexKey = (key: string) => /^\d+$/.test(key)

/**
 * Desfaz o que o banco faz com listas **dentro** de um registro: um import de
 * JSON volta com `domains` como `{ "0": …, "1": … }`. Objeto cujas chaves são
 * todas índices vira lista de novo, na ordem dos índices.
 *
 * O outro estrago do banco — `null` e lista vazia somem — é resolvido no
 * schema, com `default` nos campos que podem chegar assim.
 */
const fromStored = (stored: unknown): unknown => {
  if (Array.isArray(stored)) {
    return stored.filter((item) => item !== null && item !== undefined).map(fromStored)
  }

  if (!stored || typeof stored !== "object") {
    return stored
  }

  const entries = Object.entries(stored)

  if (entries.length > 0 && entries.every(([key]) => isIndexKey(key))) {
    return entries
      .sort(([left], [right]) => Number(left) - Number(right))
      .map(([, item]) => fromStored(item))
  }

  return Object.fromEntries(entries.map(([key, item]) => [key, fromStored(item)]))
}

export type ResolvedCompendium = {
  compendium: Compendium
  origin: CompendiumOrigin
  /** Coleções que existiam no banco e foram recusadas pelo schema. */
  rejected: readonly CompendiumCollection[]
}

/**
 * Banco primeiro, JSON do repositório depois — **coleção a coleção**.
 *
 * Uma coleção quebrada no banco não derruba as outras: cai para o fallback
 * sozinha e fica listada em `rejected`. Coleção ausente não é recusa, é só o
 * banco ainda não ter aquilo.
 */
export const resolveCompendium = (remote: unknown, fallback: Compendium): ResolvedCompendium => {
  const stored = (remote && typeof remote === "object" ? remote : {}) as Record<string, unknown>
  const compendium = { ...fallback }
  const origin = {} as Record<CompendiumCollection, "remote" | "fallback">
  const rejected: CompendiumCollection[] = []

  for (const collection of COMPENDIUM_COLLECTIONS) {
    origin[collection] = "fallback"

    if (stored[collection] === undefined || stored[collection] === null) {
      continue
    }

    const parsed = COMPENDIUM_SCHEMAS[collection].safeParse(fromStored(toList(stored[collection])))

    if (!parsed.success || parsed.data.length === 0) {
      rejected.push(collection)
      continue
    }

    Object.assign(compendium, { [collection]: parsed.data })
    origin[collection] = "remote"
  }

  return { compendium, origin, rejected }
}

/** Feature de equipamento pelo nome, ou `undefined` se o registro não tem. */
export const findEquipmentFeature = (compendium: Compendium, featureName: string | null) =>
  featureName ? compendium.features.find((feature) => feature.name === featureName) : undefined

/**
 * Números e features de uma armadura nomeada: os da linha no tier da peça,
 * e as features da linha e da peça, nessa ordem.
 */
export const describeNamedArmor = (compendium: Compendium, armorName: string) => {
  const named = compendium.namedArmor.find((candidate) => candidate.name === armorName)
  const line = named ? compendium.armorLines.find((candidate) => candidate.name === named.line) : undefined

  if (!named || !line) {
    return null
  }

  return {
    armor: named,
    stats: line.tiers[named.tier - 1],
    features: [line.feature, named.feature].filter((feature): feature is string => feature !== null),
  }
}
