/**
 * A silhueta de cada dado, num quadro de 24×24.
 *
 * São os contornos que se reconhece na mesa — o d4 triangular, o d6 quadrado,
 * o d20 icosaédrico —, não polígonos de n lados: um polígono de 20 lados é um
 * círculo, e ninguém chama aquilo de d20.
 *
 * Só os pontos moram aqui. Traço, cor e tamanho são do componente, e uma lista
 * de `path` completo levaria a decisão visual para dentro do dado.
 */
export const DIE_SHAPE_POINTS: Readonly<Record<number, string>> = {
  4: "12 3 22 20 2 20",
  6: "4 4 20 4 20 20 4 20",
  8: "12 2 21 12 12 22 3 12",
  10: "12 2 21 10 12 22 3 10",
  12: "12 2 21 8.5 17.5 19 6.5 19 3 8.5",
  20: "12 2 20.5 7 20.5 17 12 22 3.5 17 3.5 7",
}

/** O traço de dentro que dá volume à silhueta. Dado sem ele fica plano. */
export const DIE_SHAPE_FACETS: Readonly<Record<number, readonly string[]>> = {
  4: ["M12 3 L12 20"],
  6: [],
  8: ["M3 12 L21 12"],
  10: ["M3 10 L12 14 L21 10", "M12 14 L12 22"],
  12: ["M12 2 L8 11 L12 15 L16 11 Z", "M3 8.5 L8 11", "M21 8.5 L16 11", "M8 11 L6.5 19", "M16 11 L17.5 19"],
  20: ["M12 2 L7 10 L17 10 Z", "M7 10 L12 18 L17 10", "M3.5 7 L7 10", "M20.5 7 L17 10", "M7 10 L3.5 17", "M17 10 L20.5 17", "M12 18 L12 22"],
}
