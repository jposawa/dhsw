import { describe, expect, it } from "vitest"

import { parseBlocks, parseInline } from "./markdown"

describe("parseInline", () => {
  it("le forte, enfase e crase", () => {
    expect(parseInline("marque **Stress** em *Close* com `Tech`")).toEqual([
      { kind: "text", value: "marque " },
      { kind: "strong", value: "Stress" },
      { kind: "text", value: " em " },
      { kind: "emphasis", value: "Close" },
      { kind: "text", value: " com " },
      { kind: "strong", value: "Tech" },
    ])
  })
})

describe("parseBlocks", () => {
  it("separa paragrafo de lista", () => {
    const blocks = parseBlocks("O droide pode:\n- atacar\n- defender")

    expect(blocks.map((block) => block.kind)).toEqual(["paragraph", "list"])
  })

  it("le o titulo das sub-habilidades em vez de imprimir o ###", () => {
    const blocks = parseBlocks("### Tutaminis\nNegue o dano.")

    expect(blocks[0]).toEqual({
      kind: "heading",
      tokens: [{ kind: "text", value: "Tutaminis" }],
    })
    expect(blocks[1].kind).toBe("paragraph")
  })

  it("trata qualquer nivel de # como o mesmo titulo — a carta e a raiz", () => {
    const kinds = parseBlocks("# Um\n## Dois\n###### Seis").map((block) => block.kind)

    expect(kinds).toEqual(["heading", "heading", "heading"])
  })

  it("nao confunde um paragrafo que comeca com # sem espaco", () => {
    const blocks = parseBlocks("#1 alvo dentro de Close")

    expect(blocks[0].kind).toBe("paragraph")
  })

  it("fecha a lista aberta antes de comecar um titulo", () => {
    const kinds = parseBlocks("- primeiro\n### Segunda habilidade\ntexto").map(
      (block) => block.kind,
    )

    expect(kinds).toEqual(["list", "heading", "paragraph"])
  })

  it("mantem forte e enfase dentro do titulo", () => {
    const [heading] = parseBlocks("### Ataque com **Finesse**")

    expect(heading).toEqual({
      kind: "heading",
      tokens: [
        { kind: "text", value: "Ataque com " },
        { kind: "strong", value: "Finesse" },
      ],
    })
  })
})
