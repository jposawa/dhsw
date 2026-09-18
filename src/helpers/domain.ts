import type { CSSProperties } from "react"

import type { Domain } from "@/types"

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
