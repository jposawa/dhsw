import type React from "react"

import type { SaveStateKind } from "@/types"

/**
 * A arte dos quatro estados, no mesmo formato de `DomainSymbol/symbols.tsx`:
 * um registro de conteúdo de `<svg>`, e não quatro componentes.
 *
 * Ficam aqui e não em `components/NavIcon`: aquele é o catálogo da navegação, e
 * estes quatro só existem para este estado.
 */
export const SAVE_STATE_ART: Readonly<Record<SaveStateKind, React.ReactNode>> = {
  saved: <path d="M3 8.5 6.5 12 13 4.5" />,

  /* Arco de três quartos: é a falta do quarto restante que faz a rotação ser
     visível. Um círculo inteiro girando parece parado. */
  saving: <path d="M14 8a6 6 0 1 0-2.2 4.6" />,

  failed: (
    <>
      <path d="M8 2.5 15 14H1z" />
      <path d="M8 6.5v3.5" />
      <path d="M8 12h.01" />
    </>
  ),

  local: (
    <>
      <rect x="4.5" y="1.5" width="7" height="13" rx="1" />
      <path d="M7 12.5h2" />
    </>
  ),
}
