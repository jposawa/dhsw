/** Markdown minimo dos textos de carta. Parser em `helpers/markdown.ts`. */

export type InlineToken =
  | { kind: 'text'; value: string }
  | { kind: 'strong'; value: string }
  | { kind: 'emphasis'; value: string }

export type Block =
  | { kind: 'paragraph'; tokens: readonly InlineToken[] }
  | { kind: 'list'; items: readonly (readonly InlineToken[])[] }
