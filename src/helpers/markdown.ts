import type { Block, InlineToken } from "@/types"

/**
 * Parser do markdown minimo dos textos de carta: **forte**, *enfase*,
 * `codigo`, listas. Puro — descreve, nao renderiza.
 */

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

    flushList()
    blocks.push({ kind: "paragraph", tokens: parseInline(line) })
  }

  flushList()

  return blocks
}
