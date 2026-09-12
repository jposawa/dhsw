import { describe, expect, it } from "vitest"

import { DOMAIN_LIST } from "@/constants"

import { COMPENDIUM_COLLECTIONS, COMPENDIUM_SCHEMAS, FALLBACK_COMPENDIUM } from "./index"

/*
 * O JSON de `data/` é editado à mão e é o mesmo que se importa no banco.
 * Estas invariantes quebram o teste, e não a mesa.
 */

const namesOf = (list: readonly { name: string }[]) => list.map((entry) => entry.name)

const repeated = (names: readonly string[]) =>
  names.filter((name, index) => names.indexOf(name) !== index)

describe("compêndio embarcado", () => {
  it.each(COMPENDIUM_COLLECTIONS)("%s passa no schema do banco", (collection) => {
    const parsed = COMPENDIUM_SCHEMAS[collection].safeParse(FALLBACK_COMPENDIUM[collection])

    expect(parsed.success ? [] : parsed.error.issues.slice(0, 3)).toEqual([])
  })

  // Ação de downtime tem id próprio: "Prepare" existe no Rest e no Long Rest.
  const referencedByName = COMPENDIUM_COLLECTIONS.filter((collection) => collection !== "downtimeMoves")

  it.each(referencedByName)("%s não repete nome — a ficha referencia por nome", (collection) => {
    expect(repeated(namesOf(FALLBACK_COMPENDIUM[collection]))).toEqual([])
  })

  it("ação de downtime não repete id", () => {
    expect(repeated(FALLBACK_COMPENDIUM.downtimeMoves.map((move) => move.id))).toEqual([])
  })

  it("cada domínio tem 21 cartas: 3 no nível 1 e 2 em cada nível de 2 a 10", () => {
    for (const domain of DOMAIN_LIST) {
      const cards = FALLBACK_COMPENDIUM.skills.filter((skill) => skill.domain === domain)
      const perLevel = Array.from(
        { length: 10 },
        (_, index) => cards.filter((card) => card.level === index + 1).length,
      )

      expect({ domain, perLevel }).toEqual({ domain, perLevel: [3, 2, 2, 2, 2, 2, 2, 2, 2, 2] })
    }
  })

  it("cada classe tem 2 domínios e 2 subclasses que existem", () => {
    const subclassNames = namesOf(FALLBACK_COMPENDIUM.subclasses)

    for (const klass of FALLBACK_COMPENDIUM.classes) {
      expect(klass.domains).toHaveLength(2)
      expect(klass.subclasses).toHaveLength(2)
      expect(klass.subclasses.filter((name) => !subclassNames.includes(name))).toEqual([])
    }
  })

  it("cada domínio aparece em exatamente 2 classes", () => {
    for (const domain of DOMAIN_LIST) {
      const uses = FALLBACK_COMPENDIUM.classes.filter((klass) => klass.domains.includes(domain))

      expect({ domain, uses: uses.length }).toEqual({ domain, uses: 2 })
    }
  })

  it("subclasse aponta para classe que existe", () => {
    const classNames = namesOf(FALLBACK_COMPENDIUM.classes)
    const orphans = FALLBACK_COMPENDIUM.subclasses.filter(
      (subclass) => !classNames.includes(subclass.className),
    )

    expect(namesOf(orphans)).toEqual([])
  })

  it("armadura nomeada aponta para linha que existe", () => {
    const lines = namesOf(FALLBACK_COMPENDIUM.armorLines)
    const orphans = FALLBACK_COMPENDIUM.namedArmor.filter((armor) => !lines.includes(armor.line))

    expect(namesOf(orphans)).toEqual([])
  })
})
