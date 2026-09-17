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

/**
 * Filtra normalizando na hora, sem índice.
 *
 * O índice pré-computado existe por causa das 126 cartas, cada uma com o texto
 * inteiro do efeito — normalizar tudo isso a cada tecla custaria. Fora delas, o
 * maior conjunto do compêndio tem 27 entradas: gerar, versionar e manter um
 * índice para isso é máquina a mais para trabalho que não existe.
 */
export const filterByText = <TItem>(
  items: readonly TItem[],
  textOf: (item: TItem) => string,
  query: string,
): TItem[] => {
  const normalized = normalizeForSearch(query)

  if (!normalized) {
    return [...items]
  }

  return items.filter((item) => normalizeForSearch(textOf(item)).includes(normalized))
}
