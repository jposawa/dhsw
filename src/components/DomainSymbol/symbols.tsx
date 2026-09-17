import type { Domain } from "@/types"

/**
 * Os seis emblemas de domínio, em traço geométrico.
 *
 * Só o **miolo** de cada um mora aqui — o `<svg>`, o `viewBox` e a espessura do
 * traço são do `DomainSymbol`, uma vez só. É o que garante que os seis tenham
 * o mesmo peso de linha e o mesmo enquadramento: seis `<svg>` soltos divergem
 * no primeiro que alguém ajustar.
 *
 * Desenhados numa grade de 24×24, sobre os mesmos elementos do mapa da galáxia
 * que dá a marca do app: arcos concêntricos, raios a partir do centro e cortes
 * retos. Nenhum usa preenchimento — a cor vem do traço, que é `currentColor`, e
 * é isso que deixa o emblema assumir a cor do domínio sem uma segunda cópia por
 * tema.
 *
 * O que cada um diz, de `compendium/domains.ts`:
 *
 *   Aegis    proteger, planejar    escudo de placas sobrepostas
 *   Allure   influenciar, atrair   ondas que partem de um ponto
 *   Edge     viagem e tecnologia   órbita cortando um núcleo hexagonal
 *   Essence  ligação com a Força   centro que irradia, contido por um anel
 *   Havoc    força direta          impacto que parte o anel
 *   Veil     furtividade, segredo  eclipse: o disco encoberto
 */
export const DOMAIN_SYMBOL_ART: Readonly<Record<Domain, React.ReactNode>> = {
  /* Escudo: placas sobrepostas que se fecham para baixo. */
  Aegis: (
    <>
      <path d="M12 2.6 4.4 5.8v6.1c0 4.4 3.1 7.6 7.6 9.5 4.5-1.9 7.6-5.1 7.6-9.5V5.8Z" />
      <path d="M12 6.2 7.7 8v4c0 2.7 1.8 4.7 4.3 5.9 2.5-1.2 4.3-3.2 4.3-5.9V8Z" opacity=".65" />
      <path d="M12 9.6v5.2" opacity=".45" />
    </>
  ),

  /* Atração: ondas concêntricas abrindo de um ponto, e o ponto. */
  Allure: (
    <>
      <circle cx="12" cy="12" r="1.7" />
      <path d="M15.6 8.4a5.1 5.1 0 0 1 0 7.2M8.4 15.6a5.1 5.1 0 0 1 0-7.2" />
      <path d="M18.2 5.8a8.8 8.8 0 0 1 0 12.4M5.8 18.2A8.8 8.8 0 0 1 5.8 5.8" opacity=".55" />
    </>
  ),

  /* Astro + Forge: a órbita inclinada cruzando o núcleo de seis lados. */
  Edge: (
    <>
      <path d="M12 5.6 17.5 8.8v6.4L12 18.4 6.5 15.2V8.8Z" />
      <ellipse cx="12" cy="12" rx="10" ry="4.4" transform="rotate(-28 12 12)" opacity=".6" />
      <circle cx="12" cy="12" r="1.3" opacity=".85" />
    </>
  ),

  /* A Força: um centro que irradia, contido por um anel aberto. */
  Essence: (
    <>
      <circle cx="12" cy="12" r="2.4" />
      <path d="M12 2.8v3.4M12 17.8v3.4M2.8 12h3.4M17.8 12h3.4" opacity=".7" />
      <path d="M20.4 12a8.4 8.4 0 0 1-8.4 8.4A8.4 8.4 0 0 1 3.6 12" opacity=".5" />
      <path d="M5.4 6.6 8 9.2M16 14.8l2.6 2.6M18.6 6.6 16 9.2M8 14.8l-2.6 2.6" opacity=".35" />
    </>
  ),

  /* Impacto: a lasca atravessa e parte o anel — os arcos não se fecham. */
  Havoc: (
    <>
      <path d="M13.6 2.6 7.2 12.9h3.9l-1.3 8.5 6.6-10.4h-4Z" />
      <path d="M6.7 4.9a9 9 0 0 0-2.3 10.7M17.3 19.1a9 9 0 0 0 2.3-10.7" opacity=".55" />
    </>
  ),

  /* Eclipse: o disco encoberto, e o que dele ainda escapa. */
  Veil: (
    <>
      <circle cx="12" cy="12" r="8.6" opacity=".45" />
      <path d="M12 3.4a8.6 8.6 0 0 0 0 17.2 8.6 8.6 0 0 0 4.7-1.4 7.2 7.2 0 0 1 0-14.4A8.6 8.6 0 0 0 12 3.4Z" />
      <path d="M17.4 8.2h3.8M17.4 12h4.4M17.4 15.8h3.8" opacity=".5" />
    </>
  ),
}
