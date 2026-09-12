import type { Block, InlineToken } from "@/types"

/**
 * Parser do markdown minimo dos textos de carta: **forte**, *enfase*,
 * `codigo`, titulo, listas. Puro — descreve, nao renderiza.
 */

/**
 * `#` ate `######`, todos tratados como o mesmo titulo.
 *
 * O dado usa `###` porque veio do Notion, onde a carta era uma pagina e o
 * nivel vinha da arvore dela. Aqui a carta e a raiz, e as sub-habilidades sao
 * irmas — preservar o nivel do export so importaria um degrau que nao existe
 * mais. Ver `types/markdown.ts`.
 */
const HEADING_PATTERN = /^#{1,6}\s+/

const INLINE_PATTERN = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g

export const parseInline = (line: string): InlineToken[] =>
  line
    .split(INLINE_PATTERN)
    .filter((part) => part.length > 0)
    .map((part) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return { kind: "strong", value: part.slice(2, -2) } as const
      }

      // Crase marca termo mecanico (`Lightblade Resistant`) — mesmo peso de forte.
      if (part.startsWith("`") && part.endsWith("`")) {
        return { kind: "strong", value: part.slice(1, -1) } as const
      }

      if (part.startsWith("*") && part.endsWith("*")) {
        return { kind: "emphasis", value: part.slice(1, -1) } as const
      }

      return { kind: "text", value: part } as const
    })

export const parseBlocks = (text: string): Block[] => {
  const blocks: Block[] = []
  let listItems: InlineToken[][] = []

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push({ kind: "list", items: listItems })
      listItems = []
    }
  }

  for (const rawLine of String(text ?? "").split("\n")) {
    const line = rawLine.trim()

    if (!line) {
      continue
    }

    if (/^[-*]\s+/.test(line)) {
      listItems.push(parseInline(line.replace(/^[-*]\s+/, "")))
      continue
    }

    if (HEADING_PATTERN.test(line)) {
      flushList()
      blocks.push({ kind: "heading", tokens: parseInline(line.replace(HEADING_PATTERN, "")) })
      continue
    }

    flushList()
    blocks.push({ kind: "paragraph", tokens: parseInline(line) })
  }

  flushList()

  return blocks
}
