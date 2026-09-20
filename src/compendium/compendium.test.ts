import { describe, expect, it } from "vitest"

import {
  DAMAGE_KIND_LIST,
  DAMAGE_TYPE_LIST,
  DOMAIN_LIST,
  RANGE_LIST,
  TRAIT_LIST,
} from "@/constants"
import type { FeatureModifier, TokenPool } from "@/types"

import { COMPENDIUM_COLLECTIONS, EMPTY_COMPENDIUM } from "./index"
import { LOCAL_COMPENDIUM } from "./testing"

/*
 * O JSON de `data/compendium/` é editado à mão e é o que se importa no banco.
 * Estas invariantes quebram o teste, e não a mesa.
 *
 * A pasta não é versionada: sem ela (no CI), o bloco inteiro se pula. Quem
 * edita o compêndio roda estes testes antes do `export:database`.
 */

const REAL = LOCAL_COMPENDIUM ?? EMPTY_COMPENDIUM

const namesOf = (list: readonly { name: string }[]) => list.map((entry) => entry.name)

const isIntegerIn = (value: number, min: number, max: number) =>
  Number.isInteger(value) && value >= min && value <= max

const SKILL_CATEGORIES = ["Ability", "Force", "Holocron"]

const MODIFIER_TARGETS: readonly string[] = [
  ...TRAIT_LIST.map((trait) => `trait.${trait}`),
  "evasion",
  "armorScore",
  "majorThreshold",
  "severeThreshold",
  "hitPointsMax",
  "stressMax",
  "proficiency",
]

const TOKEN_REFILLS = ["rest", "longRest", "manual"]

const isTokenScale = ({ scale, domain }: TokenPool) =>
  scale === "tier" ||
  scale === "proficiency" ||
  scale === "forcewield" ||
  (scale === "domainCards" && domain !== undefined && DOMAIN_LIST.includes(domain)) ||
  TRAIT_LIST.some((trait) => trait === scale)

const repeated = (names: readonly string[]) =>
  names.filter((name, index) => names.indexOf(name) !== index)

describe.skipIf(LOCAL_COMPENDIUM === null)("compêndio real (data/compendium)", () => {
  it.each(COMPENDIUM_COLLECTIONS)(
    "%s tem nome em todo registro, sem espaço sobrando",
    (collection) => {
      const bad = REAL[collection].filter(
        (entry) => entry.name.trim() === "" || entry.name !== entry.name.trim(),
      )

      expect(namesOf(bad)).toEqual([])
    },
  )

  it("carta: domínio, nível, Recall Cost e categoria válidos", () => {
    const bad = REAL.skills.filter(
      (skill) =>
        !DOMAIN_LIST.includes(skill.domain) ||
        !isIntegerIn(skill.level, 1, 10) ||
        !isIntegerIn(skill.recallCost, 0, 10) ||
        !SKILL_CATEGORIES.includes(skill.category) ||
        skill.text.trim() === "",
    )

    expect(namesOf(bad)).toEqual([])
  })

  it("classe: Evasion, HP e features com texto", () => {
    const bad = REAL.classes.filter(
      (klass) =>
        !Number.isInteger(klass.evasion) ||
        !isIntegerIn(klass.hitPoints, 1, 12) ||
        klass.features.length === 0 ||
        klass.features.some((feature) => feature.text.trim() === "") ||
        klass.hopeFeature.trim() === "",
    )

    expect(namesOf(bad)).toEqual([])
  })

  it("subclasse: Forcewielding é um atributo, ou nenhum", () => {
    const bad = REAL.subclasses.filter(
      (subclass) =>
        subclass.spellcastTrait !== null && !TRAIT_LIST.includes(subclass.spellcastTrait),
    )

    expect(namesOf(bad)).toEqual([])
  })

  it("arma: atributo, alcance, dado, bônus por tier e tipo de dano válidos", () => {
    const bad = REAL.weapons.filter(
      (weapon) =>
        !(weapon.trait === "Forcewield" || TRAIT_LIST.includes(weapon.trait)) ||
        !RANGE_LIST.includes(weapon.range) ||
        !/^d\d+$/.test(weapon.damageDie) ||
        weapon.bonusByTier.length !== 4 ||
        !DAMAGE_TYPE_LIST.includes(weapon.damageType) ||
        !DAMAGE_KIND_LIST.includes(weapon.damageKind) ||
        !(weapon.customizable === null || isIntegerIn(weapon.customizable, 0, 10)),
    )

    expect(namesOf(bad)).toEqual([])
  })

  it("armadura: linha com quatro tiers, peça e item com tier de 1 a 4", () => {
    expect(
      namesOf(REAL.armorLines.filter((line) => line.tiers.length !== 4)),
    ).toEqual([])

    const tiered = [
      ...REAL.namedArmor,
      ...REAL.items,
      ...REAL.consumables,
      ...REAL.augments,
    ]

    expect(namesOf(tiered.filter((entry) => !isIntegerIn(entry.tier, 1, 4)))).toEqual([])
  })

  it("modificador permanente: alvo válido e value ou valueByTier, um dos dois", () => {
    const modifiers: FeatureModifier[] = [
      ...REAL.features.flatMap((feature) => feature.modifiers ?? []),
      ...REAL.augments.flatMap((augment) => augment.modifiers ?? []),
      ...REAL.ancestries.flatMap((ancestry) => ancestry.modifiers ?? []),
      ...REAL.subclasses.flatMap((subclass) =>
        [...subclass.foundation, ...subclass.specialization, ...subclass.mastery].flatMap(
          (feature) => feature.modifiers ?? [],
        ),
      ),
    ]

    const bad = modifiers.filter(
      (modifier) =>
        !MODIFIER_TARGETS.includes(modifier.target) ||
        (modifier.value === undefined) === (modifier.valueByTier === undefined) ||
        (modifier.valueByTier !== undefined && modifier.valueByTier.length !== 4),
    )

    expect(bad).toEqual([])
  })

  const featurePools = [
    ...REAL.classes.flatMap((klass) =>
      klass.features.map((feature) => ({ owner: klass.name, feature })),
    ),
    ...REAL.subclasses.flatMap((subclass) =>
      [...subclass.foundation, ...subclass.specialization, ...subclass.mastery].map((feature) => ({
        owner: subclass.name,
        feature,
      })),
    ),
  ].flatMap(({ owner, feature }) =>
    feature.tokens ? [{ owner, name: feature.name, tokens: feature.tokens }] : [],
  )

  const cardPools = REAL.skills.flatMap((skill) =>
    (skill.tokens ?? []).map((tokens) => ({ owner: skill.name, name: tokens.name, tokens })),
  )

  const allPools: { owner: string; name: string; tokens: TokenPool }[] = [
    ...featurePools,
    ...cardPools,
  ]

  const labelOf = ({ owner, name }: { owner: string; name: string }) => `${owner} · ${name}`

  it("token: escala e reposição válidas", () => {
    const bad = allPools.filter(
      ({ tokens }) =>
        !TOKEN_REFILLS.includes(tokens.refill) ||
        (tokens.scale !== undefined && !isTokenScale(tokens)) ||
        (tokens.maxAtLeast !== undefined && !isIntegerIn(tokens.maxAtLeast, 0, 10)),
    )

    expect(bad.map(labelOf)).toEqual([])
  })

  /* A chave do contador na ficha é `fonte:dono:nome`. */
  it("token: dono e nome sem ':', e sem contador repetido na mesma carta", () => {
    expect(allPools.filter((pool) => labelOf(pool).includes(":")).map(labelOf)).toEqual([])
    expect(repeated(allPools.map(labelOf))).toEqual([])
  })

  /* Contador com nome próprio nomeia algo que o texto da carta cita: a habilidade
     da Holocron, ou os "charges" e o "shield" de uma carta de dois contadores. */
  it("token: contador de carta tem nome citado no texto dela", () => {
    const bad = cardPools.filter(({ owner, name }) => {
      const skill = REAL.skills.find((candidate) => candidate.name === owner)

      return name !== owner && !skill?.text.toLowerCase().includes(name.toLowerCase())
    })

    expect(bad.map(labelOf)).toEqual([])
  })

  /* O Action Tracker era do beta. O livro tem holofote e Fear (p. 89), e as
     cartas foram convertidas para eles. */
  it("nenhuma carta cita o Action Tracker do beta", () => {
    const bad = REAL.skills.filter((skill) =>
      /action (tracker|token)/i.test(skill.text),
    )

    expect(namesOf(bad)).toEqual([])
  })

  it("ação de downtime: descanso, efeito e dado válidos", () => {
    const bad = REAL.downtimeMoves.filter(
      (move) =>
        !["short", "long"].includes(move.rest) ||
        !["clearRolled", "clearAll", "gainHope", "narrative"].includes(move.effect.kind) ||
        (move.effect.kind === "clearRolled" && !/^\d+d\d+$/.test(move.effect.dice)),
    )

    expect(namesOf(bad)).toEqual([])
  })

  // Ação de downtime tem id próprio: "Prepare" existe no Rest e no Long Rest.
  const referencedByName = COMPENDIUM_COLLECTIONS.filter(
    (collection) => collection !== "downtimeMoves",
  )

  it.each(referencedByName)("%s não repete nome — a ficha referencia por nome", (collection) => {
    expect(repeated(namesOf(REAL[collection]))).toEqual([])
  })

  it("ação de downtime não repete id", () => {
    expect(repeated(REAL.downtimeMoves.map((move) => move.id))).toEqual([])
  })

  it("cada domínio tem 21 cartas: 3 no nível 1 e 2 em cada nível de 2 a 10", () => {
    for (const domain of DOMAIN_LIST) {
      const cards = REAL.skills.filter((skill) => skill.domain === domain)
      const perLevel = Array.from(
        { length: 10 },
        (_, index) => cards.filter((card) => card.level === index + 1).length,
      )

      expect({ domain, perLevel }).toEqual({ domain, perLevel: [3, 2, 2, 2, 2, 2, 2, 2, 2, 2] })
    }
  })

  it("cada classe tem 2 domínios e 2 subclasses que existem", () => {
    const subclassNames = namesOf(REAL.subclasses)

    for (const klass of REAL.classes) {
      expect(klass.domains).toHaveLength(2)
      expect(klass.subclasses).toHaveLength(2)
      expect(klass.subclasses.filter((name) => !subclassNames.includes(name))).toEqual([])
    }
  })

  it("cada domínio aparece em exatamente 2 classes", () => {
    for (const domain of DOMAIN_LIST) {
      const uses = REAL.classes.filter((klass) => klass.domains.includes(domain))

      expect({ domain, uses: uses.length }).toEqual({ domain, uses: 2 })
    }
  })

  it("subclasse aponta para classe que existe", () => {
    const classNames = namesOf(REAL.classes)
    const orphans = REAL.subclasses.filter(
      (subclass) => !classNames.includes(subclass.className),
    )

    expect(namesOf(orphans)).toEqual([])
  })

  it("toda feature citada por arma e armadura existe no registro", () => {
    const registered = namesOf(REAL.features)
    const cited = [
      ...REAL.weapons.map((weapon) => weapon.feature),
      ...REAL.namedArmor.map((armor) => armor.feature),
      ...REAL.armorLines.map((line) => line.feature),
    ].filter((feature): feature is string => feature !== null)

    expect(cited.filter((feature) => !registered.includes(feature))).toEqual([])
  })

  it("armadura nomeada aponta para linha que existe", () => {
    const lines = namesOf(REAL.armorLines)
    const orphans = REAL.namedArmor.filter((armor) => !lines.includes(armor.line))

    expect(namesOf(orphans)).toEqual([])
  })
})
