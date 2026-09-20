/** Rolagens guardadas neste aparelho, na página de rolagem e em ficha sem mesa. */
export const LOCAL_ROLL_LIMIT = 100

/** Rolagens guardadas por mesa, em cada nó (público e do Narrador). */
export const PARTY_ROLL_LIMIT = 200

/** Rolagens da mesa na tela, ao vivo. */
export const PARTY_ROLLS_SHOWN = 50

/** Os dados do atalho, na ordem da mesa. Também é a escada de troca do Duality. */
export const DIE_SIDES = [4, 6, 8, 10, 12, 20] as const

/** O dado de Hope e de Fear do livro (p. 90). Feature pode trocar — ver `DicePool`. */
export const DUALITY_SIDES = 12
