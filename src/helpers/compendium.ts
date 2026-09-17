import { COMPENDIUM_COLLECTIONS } from "@/compendium"
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

type FieldKind = "string" | "number" | "boolean" | "list" | "record" | "null"

type FieldRule = {
  kinds: ReadonlySet<FieldKind>
  /** Presente em todo registro do JSON. */
  isRequired: boolean
}

type StoredRecord = Record<string, unknown>

const kindOf = (value: unknown): FieldKind | null => {
  if (value === null) {
    return "null"
  }

  if (Array.isArray(value)) {
    return "list"
  }

  const kind = typeof value

  if (kind === "object") {
    return "record"
  }

  return kind === "string" || kind === "number" || kind === "boolean" ? kind : null
}

const isRecord = (value: unknown): value is StoredRecord => kindOf(value) === "record"

/**
 * O molde de uma coleção, tirado do próprio JSON do repositório: que campos
 * todo registro tem, e de que tipo cada campo aparece.
 *
 * É o que dispensa declarar o formato uma segunda vez — o `type` de `types/`
 * continua sendo a única declaração, e o JSON, que já é conferido contra as
 * regras em `compendium.test.ts`, é o exemplo do que vale.
 */
const shapeOf = (records: readonly object[]): ReadonlyMap<string, FieldRule> => {
  const counts = new Map<string, number>()
  const kinds = new Map<string, Set<FieldKind>>()

  for (const record of records) {
    for (const [key, value] of Object.entries(record)) {
      const kind = kindOf(value)

      if (value === undefined || kind === null) {
        continue
      }

      counts.set(key, (counts.get(key) ?? 0) + 1)
      kinds.set(key, (kinds.get(key) ?? new Set()).add(kind))
    }
  }

  return new Map(
    [...kinds].map(([key, fieldKinds]) => [
      key,
      { kinds: fieldKinds, isRequired: counts.get(key) === records.length },
    ]),
  )
}

/**
 * Um registro do banco, conferido contra o molde. O banco apaga `null` e lista
 * vazia: campo obrigatório que falta volta com esse valor quando o molde o
 * admite. Qualquer outro campo obrigatório ausente, ou de tipo que o JSON
 * nunca usa, recusa o registro.
 */
const conform = (value: unknown, shape: ReadonlyMap<string, FieldRule>): StoredRecord | null => {
  if (!isRecord(value)) {
    return null
  }

  const record: StoredRecord = { ...value }

  for (const [key, rule] of shape) {
    if (record[key] === undefined && rule.isRequired) {
      if (rule.kinds.has("null")) {
        record[key] = null
      } else if (rule.kinds.has("list")) {
        record[key] = []
      } else {
        return null
      }
    }
  }

  for (const [key, field] of Object.entries(record)) {
    const rule = shape.get(key)
    const kind = kindOf(field)

    if (rule && (kind === null || !rule.kinds.has(kind))) {
      return null
    }
  }

  return record
}

export type ResolvedCompendium = {
  compendium: Compendium
  origin: CompendiumOrigin
  /** Coleções que existiam no banco e foram recusadas. */
  rejected: readonly CompendiumCollection[]
}

/**
 * Banco primeiro, JSON do repositório depois — **coleção a coleção**.
 *
 * Uma coleção quebrada no banco não derruba as outras: cai para o fallback
 * sozinha e fica listada em `rejected`. Coleção ausente não é recusa, é só o
 * banco ainda não ter aquilo. Um registro fora do molde recusa a coleção
 * inteira: meia coleção do banco com meia do JSON seria um compêndio que
 * ninguém escreveu.
 */
export const resolveCompendium = (remote: unknown, fallback: Compendium): ResolvedCompendium => {
  const stored = isRecord(remote) ? remote : {}
  const compendium = { ...fallback }
  const origin = {} as Record<CompendiumCollection, "remote" | "fallback">
  const rejected: CompendiumCollection[] = []

  for (const collection of COMPENDIUM_COLLECTIONS) {
    origin[collection] = "fallback"

    if (stored[collection] === undefined || stored[collection] === null) {
      continue
    }

    const list = fromStored(toList(stored[collection]))
    const shape = shapeOf(fallback[collection])
    const records = Array.isArray(list) ? list.map((item) => conform(item, shape)) : []

    if (records.length === 0 || records.some((record) => record === null)) {
      rejected.push(collection)
      continue
    }

    Object.assign(compendium, { [collection]: records })
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
  const line = named
    ? compendium.armorLines.find((candidate) => candidate.name === named.line)
    : undefined

  if (!named || !line) {
    return null
  }

  return {
    armor: named,
    stats: line.tiers[named.tier - 1],
    features: [line.feature, named.feature].filter(
      (feature): feature is string => feature !== null,
    ),
  }
}
