/** Markdown minimo dos textos de carta. Parser em `helpers/markdown.ts`. */

export type InlineToken =
  | { kind: "text"; value: string }
  | { kind: "strong"; value: string }
  | { kind: "emphasis"; value: string }

export type Block =
  | { kind: "paragraph"; tokens: readonly InlineToken[] }
  /**
   * Titulo de uma sub-habilidade dentro da carta.
   *
   * As 18 cartas Holocron empacotam duas ou tres habilidades nomeadas num
   * texto so (`### Tutaminis`), e sem este bloco o `###` saia impresso na
   * tela. Sem nivel: a carta nao tem hierarquia interna — sao irmas.
   */
  | { kind: "heading"; tokens: readonly InlineToken[] }
  | { kind: "list"; items: readonly (readonly InlineToken[])[] }
