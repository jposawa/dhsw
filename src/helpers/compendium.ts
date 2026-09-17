import { COMPENDIUM_COLLECTIONS, EMPTY_COMPENDIUM } from "@/compendium"
import type { Compendium, CompendiumCollection } from "@/types"

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

type StoredRecord = Record<string, unknown>

type RecordOf<TCollection extends CompendiumCollection> = Compendium[TCollection][number]

/**
 * Os campos obrigatórios que o banco apaga — `null` e lista vazia somem ao
 * gravar — e o valor que eles tinham. Campo opcional ausente já está certo e
 * não entra aqui. Tipado contra `types/`: um nome errado não compila.
 *
 * `compendium.rtdb.test.ts` confere a ida e a volta, com o compêndio de teste
 * e, na máquina de quem tem, com o real.
 */
const DROPPED_BY_DATABASE: { readonly [K in CompendiumCollection]?: Partial<RecordOf<K>> } = {
  classes: { domains: [], subclasses: [], features: [] },
  subclasses: { spellcastTrait: null, foundation: [], specialization: [], mastery: [] },
  ancestries: { features: [] },
  armorLines: { feature: null },
  namedArmor: { feature: null },
  weapons: { feature: null, customizable: null },
}

const isRecord = (value: unknown): value is StoredRecord =>
  value !== null && typeof value === "object" && !Array.isArray(value)

/** Todo registro do compêndio tem nome — a ficha referencia por ele. */
const conform = (value: unknown, dropped: object): StoredRecord | null =>
  isRecord(value) && typeof value.name === "string" && value.name.trim() !== ""
    ? { ...dropped, ...value }
    : null

export type ResolvedCompendium = {
  compendium: Compendium
  /** Coleções que o banco ainda não tem. */
  missing: readonly CompendiumCollection[]
  /** Coleções que o banco tem, mas em formato que não se lê. */
  rejected: readonly CompendiumCollection[]
}

/**
 * O compêndio do banco, **coleção a coleção**.
 *
 * Não há JSON de reserva: coleção ausente ou recusada fica vazia, e a tela diz
 * que falta. Um registro sem nome recusa a coleção inteira — meia coleção
 * seria um compêndio que ninguém escreveu.
 *
 * O formato é o `type` de `types/`; o cuidado com ele está nos testes e no
 * `export:database`, que gera o que se importa.
 */
export const resolveCompendium = (remote: unknown): ResolvedCompendium => {
  const stored = isRecord(remote) ? remote : {}
  const compendium: Compendium = { ...EMPTY_COMPENDIUM }
  const missing: CompendiumCollection[] = []
  const rejected: CompendiumCollection[] = []

  for (const collection of COMPENDIUM_COLLECTIONS) {
    if (stored[collection] === undefined || stored[collection] === null) {
      missing.push(collection)
      continue
    }

    const list = fromStored(toList(stored[collection]))
    const dropped = DROPPED_BY_DATABASE[collection] ?? {}
    const records = Array.isArray(list) ? list.map((item) => conform(item, dropped)) : []

    if (records.length === 0 || records.some((record) => record === null)) {
      rejected.push(collection)
      continue
    }

    Object.assign(compendium, { [collection]: records })
  }

  return { compendium, missing, rejected }
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
