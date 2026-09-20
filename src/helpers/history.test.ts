import { describe, expect, it } from "vitest"

import { createCharacter } from "@/helpers"
import type { Character } from "@/types"

import { addExperience, removeExperience } from "./history"

const unwrap = (result: ReturnType<typeof addExperience>): Character => {
  if (!result.ok) {
    throw new Error(`esperado ok, veio ${result.code}`)
  }

  return result.value
}

describe("addExperience", () => {
  it("guarda a Experience, sempre a +2", () => {
    const next = unwrap(addExperience(createCharacter(), "Piloto"))

    expect(next.experiences).toEqual([{ name: "Piloto", bonus: 2 }])
  })

  it("apara o nome antes de guardar", () => {
    const next = unwrap(addExperience(createCharacter(), "  Piloto  "))

    expect(next.experiences[0].name).toBe("Piloto")
  })

  it("recusa nome em branco", () => {
    expect(addExperience(createCharacter(), "   ").ok).toBe(false)
  })

  /* Duas linhas iguais competiriam pela mesma rolagem, e nenhuma das duas
     saberia dizer qual bônus vale. */
  it("recusa nome repetido", () => {
    const first = unwrap(addExperience(createCharacter(), "Piloto"))

    expect(addExperience(first, "Piloto").ok).toBe(false)
  })

  /* Quantas a ficha tem é regra, não generosidade da mesa: duas na criação, e
     uma a cada level achievement — níveis 2, 5 e 8 (p. 109). */
  it("o nível 1 concede duas, e a terceira só no nível 2", () => {
    const uma = unwrap(addExperience(createCharacter(), "Piloto"))
    const duas = unwrap(addExperience(uma, "Ruas"))

    expect(addExperience(duas, "Mecânica")).toEqual({ ok: false, code: "experienceLimit" })
    expect(unwrap(addExperience({ ...duas, level: 2 }, "Mecânica")).experiences).toHaveLength(3)
  })
})

describe("removeExperience", () => {
  it("tira pelo nome", () => {
    const first = unwrap(addExperience(createCharacter(), "Piloto"))

    expect(unwrap(removeExperience(first, "Piloto")).experiences).toHaveLength(0)
  })

  it("recusa nome que nao existe, sem lancar", () => {
    expect(removeExperience(createCharacter(), "Piloto").ok).toBe(false)
  })
})
