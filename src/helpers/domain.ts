import type { Domain } from "@/types"

/**
 * Token CSS da cor de um dominio.
 *
 * A cor de dominio e informacao: identifica a carta. Nenhum outro elemento
 * da interface usa essas seis cores. Ver STYLING.md.
 */
export const domainColorToken = (domain: Domain | string): string =>
  `var(--color-domain-${String(domain).toLowerCase()})`
