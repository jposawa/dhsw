import type { CSSProperties } from "react"

import { TRAIT_LIST } from "@/constants"
import type { Domain, Trait } from "@/types"

/** O texto é o nome de um atributo? Guarda de tipo para o que vem gravado. */
export const isTrait = (value: string): value is Trait => TRAIT_LIST.includes(value as Trait)

/**
 * Token CSS da cor de um dominio.
 *
 * A cor de dominio e informacao: identifica a carta. Nenhum outro elemento
 * da interface usa essas seis cores. Ver STYLING.md.
 */
export const domainColorToken = (domain: Domain | string): string =>
  `var(--color-domain-${String(domain).toLowerCase()})`

/**
 * A faixa de domínio de uma entidade que tem dois — a classe e a subclasse.
 *
 * Devolve as duas cores para o CSS dividir a faixa meio a meio; com um
 * domínio só, a de baixo repete a de cima e a faixa fica de uma cor. Sem
 * domínio, `undefined`: a faixa cai no cromo, que é o certo para espécie e
 * origem. Ver `--stripe-top` em `Identity.module.css`.
 */
export const domainStripeStyle = (
  domains: readonly Domain[] = [],
): CSSProperties | undefined =>
  domains.length === 0
    ? undefined
    : ({
        "--stripe-top": domainColorToken(domains[0]),
        "--stripe-bottom": domainColorToken(domains[1] ?? domains[0]),
      } as CSSProperties)
