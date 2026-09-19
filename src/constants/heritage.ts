/**
 * A opção da mista na gaveta de espécies.
 *
 * É **id de opção da tela**, não valor guardado: a ficha guarda um `Heritage`
 * com `isMixed`, e nenhuma espécie do compêndio pode colidir com este id
 * porque ele nunca chega ao campo do nome. Antes ele era código guardado e
 * dividia campo com nome de espécie — ver `types/character.ts`.
 */
export const MIXED_ANCESTRY_OPTION = "mixed"

/** Junta as duas espécies quando a mista não tem nome próprio. */
export const MIXED_ANCESTRY_SEPARATOR = "-"

/**
 * Como a mista se chama antes de ter nome: o nome da mesa, ou o par de
 * espécies, valem mais — mas enquanto falta metade do par, dizer só "Human"
 * faz a ficha parecer de espécie única, que é o oposto do que ela é.
 */
export const MIXED_ANCESTRY_LABEL = "Ascendência mista"
