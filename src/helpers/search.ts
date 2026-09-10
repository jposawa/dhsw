const COMBINING_MARKS = new RegExp("[\u0300-\u036f]", "g")

/** Mesma normalizacao usada no build do indice: minusculas, sem acento. */
export const normalizeForSearch = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

/** Filtra contra um indice pre-computado em build time. */
export const filterByIndex = <TItem>(
  items: readonly TItem[],
  keyOf: (item: TItem) => string,
  index: Readonly<Record<string, string>>,
  query: string,
): TItem[] => {
  const normalized = normalizeForSearch(query)

  if (!normalized) {
    return [...items]
  }

  return items.filter((item) => (index[keyOf(item)] ?? "").includes(normalized))
}
