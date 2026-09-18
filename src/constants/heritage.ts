/**
 * O código de ascendência que não é espécie: a mista, em que cada feature vem
 * de uma espécie diferente. Core Rulebook, "Mixed Ancestry" (p. 70–71).
 *
 * Vive nas constantes porque é **valor guardado na ficha**, lido pela regra e
 * pela tela: um literal solto em cada lugar divergiria no primeiro ajuste.
 */
export const MIXED_ANCESTRY = "mixed"

/** Junta as duas espécies quando a mista não tem nome próprio. */
export const MIXED_ANCESTRY_SEPARATOR = "-"
