import { describe, expect, it } from "vitest"

import { isImageUrl, toImageUrl } from "./imageUrl"

describe("toImageUrl", () => {
  it("aceita http e https", () => {
    expect(toImageUrl("https://exemplo.com/kar.png")).toBe("https://exemplo.com/kar.png")
    expect(toImageUrl("  http://exemplo.com/a.jpg  ")).toBe("http://exemplo.com/a.jpg")
  })

  it("vazio é ausência de imagem, não erro", () => {
    expect(toImageUrl("")).toBeNull()
    expect(toImageUrl("   ")).toBeNull()
  })

  /* `data:` e `blob:` guardariam o arquivo dentro da ficha, que sobe para o
     banco a cada gravação e viaja no código de compartilhamento. */
  it("recusa protocolo que não seja http", () => {
    expect(toImageUrl("javascript:alert(1)")).toBeNull()
    expect(toImageUrl("data:image/png;base64,iVBORw0KGgo=")).toBeNull()
    expect(toImageUrl("blob:https://exemplo.com/abc")).toBeNull()
  })

  it("recusa o que não é URL", () => {
    expect(toImageUrl("kar.png")).toBeNull()
    expect(toImageUrl("exemplo.com/kar.png")).toBeNull()
  })

  it("isImageUrl responde a mesma pergunta", () => {
    expect(isImageUrl("https://exemplo.com/a.png")).toBe(true)
    expect(isImageUrl("nada")).toBe(false)
  })
})
