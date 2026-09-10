import { domainColorToken } from "@/helpers"
import type { BaseComponent, Domain } from "@/types"

import styles from "./DomainSymbol.module.css"
import { DOMAIN_SYMBOL_ART } from "./symbols"

type DomainSymbolProps = BaseComponent & {
  domain: Domain
  /**
   * Rótulo para leitor de tela. Sem ele o emblema é decorativo e sai da
   * árvore de acessibilidade — que é o certo quando o nome do domínio já está
   * escrito ao lado, e o contrário quando o emblema aparece sozinho.
   */
  label?: string
}

/**
 * O emblema de um domínio.
 *
 * **A cor vem do próprio domínio, não de quem chama.** É a mesma decisão do
 * `domainColorToken`: a cor identifica a carta e não se escolhe caso a caso.
 * Quem precisar de outra cor sobrescreve `color` pelo `className` — herda por
 * `currentColor` e o traço acompanha.
 *
 * O tamanho segue o `font-size` do contexto (`1em`), então o emblema acompanha
 * o texto ao lado sem precisar de uma prop de tamanho e sem descolar dele
 * quando a tipografia muda.
 */
export const DomainSymbol = ({ domain, label, className, style }: DomainSymbolProps) => (
  <svg
    className={[styles.symbol, className].filter(Boolean).join(" ")}
    style={{ color: domainColorToken(domain), ...style }}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    role={label ? "img" : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
    data-testid={`domain-symbol-${domain.toLowerCase()}`}
  >
    {DOMAIN_SYMBOL_ART[domain]}
  </svg>
)
