import { describe, expect, it } from "vitest"

import { createCharacter } from "@/helpers"
import type { Character } from "@/types"

import { addExperience, removeExperience, setExperienceBonus } from "./history"

const unwrap = (result: ReturnType<typeof addExperience>): Character => {
  if (!result.ok) {
    throw new Error(`esperado ok, veio ${result.code}`)
  }

  return result.value
}

describe("addExperience", () => {
  it("guarda a Experience com o bonus", () => {
    const next = unwrap(addExperience(createCharacter(), { name: "Piloto", bonus: 2 }))

    expect(next.experiences).toEqual([{ name: "Piloto", bonus: 2 }])
  })

  it("apara o nome antes de guardar", () => {
    const next = unwrap(addExperience(createCharacter(), { name: "  Piloto  ", bonus: 2 }))

    expect(next.experiences[0].name).toBe("Piloto")
  })

  it("recusa nome em branco", () => {
    expect(addExperience(createCharacter(), { name: "   ", bonus: 2 }).ok).toBe(false)
  })

  /* Duas linhas iguais competiriam pela mesma rolagem, e nenhuma das duas
     saberia dizer qual bônus vale. */
  it("recusa nome repetido", () => {
    const first = unwrap(addExperience(createCharacter(), { name: "Piloto", bonus: 2 }))

    expect(addExperience(first, { name: "Piloto", bonus: 3 }).ok).toBe(false)
  })
})

describe("removeExperience", () => {
  it("tira pelo nome", () => {
    const first = unwrap(addExperience(createCharacter(), { name: "Piloto", bonus: 2 }))

    expect(unwrap(removeExperience(first, "Piloto")).experiences).toHaveLength(0)
  })

  it("recusa nome que nao existe, sem lancar", () => {
    expect(removeExperience(createCharacter(), "Piloto").ok).toBe(false)
  })
})

describe("setExperienceBonus", () => {
  it("muda so o bonus da que foi nomeada", () => {
    const first = unwrap(addExperience(createCharacter(), { name: "Piloto", bonus: 2 }))
    const second = unwrap(addExperience(first, { name: "Ruas", bonus: 2 }))

    const next = unwrap(setExperienceBonus(second, "Piloto", 4))

    expect(next.experiences).toEqual([
      { name: "Piloto", bonus: 4 },
      { name: "Ruas", bonus: 2 },
    ])
  })
})
