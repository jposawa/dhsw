import type { NavIconName } from "@/types"

/**
 * Os ícones da navegação, no mesmo traço geométrico dos emblemas de domínio.
 *
 * Como em `DomainSymbol`, só o **miolo** mora aqui — o `<svg>`, o `viewBox` e a
 * espessura da linha são do componente, uma vez só, para os cinco terem o mesmo
 * peso. Grade de 24×24, sem preenchimento, `currentColor` no traço: o ícone
 * assume a cor do item, inclusive a de página atual, sem uma segunda cópia.
 *
 * Substituem os glifos Unicode `◈ ◐ ◎ ⚙`, que eram indistinguíveis entre si
 * justamente onde precisavam ser distinguíveis — no trilho recolhido, onde o
 * ícone é a única coisa que resta. Cada um agora desenha o que a página é:
 *
 *   compendium  a pilha de cartas do compêndio
 *   roster      a ficha, com a marca de quem ela é
 *   parties     três membros ligados, na geometria do mapa
 *   houseRules  os ajustes que as regras da casa realmente são
 *   account     a conta
 */
export const NAV_ICON_ART: Readonly<Record<NavIconName, React.ReactNode>> = {
  /* Pilha de cartas: a de trás recuada, a da frente com o texto da carta. */
  compendium: (
    <>
      <rect x="7.5" y="3.5" width="12.5" height="17" rx="1.4" />
      <path d="M4.5 6.6v11.8a2.1 2.1 0 0 0 2.1 2.1" opacity=".5" />
      <path d="M10.8 8.6h6M10.8 12h6M10.8 15.4h3.4" opacity=".7" />
    </>
  ),

  /* Ficha: a folha e a marca de quem ela descreve. */
  roster: (
    <>
      <rect x="4" y="3.5" width="16" height="17" rx="1.4" />
      <circle cx="12" cy="9.6" r="2.4" />
      <path d="M7.7 17.4a4.7 4.7 0 0 1 8.6 0" opacity=".75" />
    </>
  ),

  /* Grupo: três nós ligados — a mesma constelação do mapa da galáxia. */
  parties: (
    <>
      <circle cx="12" cy="5.7" r="2.3" />
      <circle cx="5.9" cy="16.5" r="2.3" />
      <circle cx="18.1" cy="16.5" r="2.3" />
      <path d="m10.5 7.7-3 6.6M13.5 7.7l3 6.6M8.2 16.5h7.6" opacity=".55" />
    </>
  ),

  /* Regras da casa: réguas com o cursor em posições diferentes. */
  houseRules: (
    <>
      <path d="M3.6 8h9.6M18.6 8H20.4" />
      <circle cx="15.9" cy="8" r="2.2" />
      <path d="M3.6 16h4.1M12.7 16h7.7" />
      <circle cx="10.2" cy="16" r="2.2" />
    </>
  ),

  /* Conta: fica no lugar do avatar enquanto não há sessão. */
  account: (
    <>
      <circle cx="12" cy="8.6" r="3.4" />
      <path d="M5.7 19.7a6.5 6.5 0 0 1 12.6 0" />
    </>
  ),
}
