/**
 * Gera src/compendium/*.ts a partir do JSON embutido em specs/dh-sw.html.
 *
 * O protótipo é a única fonte do compêndio hoje. Quando o export do Notion
 * voltar a ser a origem, só a função `readPrototypeDatabase` muda.
 *
 * Roda com: npm run build:compendium
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const PROTOTYPE_PATH = join(process.cwd(), "specs", "dh-sw.html")
const OUTPUT_DIR = join(process.cwd(), "src", "compendium")

const HEADER = [
  "// GERADO POR scripts/build-compendium.ts — NÃO EDITAR À MÃO.",
  "// Fonte: specs/dh-sw.html",
  "",
].join("\n")

/* ── formato cru do protótipo ─────────────────────────────────────────── */

type RawSkill = { n: string; d: string; l: number; r: number; c: string; t: string }
type RawClass = {
  n: string; ev: number; hp: number; evOld?: number; dom: string[]
  feat: string; hope: string; sub: string[]; hopeOld?: string; hopeWhy?: string
}
type RawFeature = { n: string; t: string }
type RawSubclass = { n: string; cls: string; trait: string; f: RawFeature[]; s: RawFeature[]; m: RawFeature[] }
type RawDomain = { n: string; desc: string }
type RawArmorLine = { l: string; ev: string; t: number[][] }
type RawNamedArmor = { n: string; l: string; t: number; f: string | null }
type RawAncestry = { n: string; f: string[]; d: string }
type RawCommunity = { n: string; d: string; f: string }
type RawWeapon = {
  n: string; tr: string; rg: string; die: string; bon: number[]
  dt: string; b: string; f: string | null; ic?: boolean
}
type RawEntry = { n: string; t: number; txt: string }

type RawDatabase = {
  skills: RawSkill[]; classes: RawClass[]; subclasses: RawSubclass[]; domains: RawDomain[]
  armor: RawArmorLine[]; armorNamed: RawNamedArmor[]; ancestries: RawAncestry[]
  communities: RawCommunity[]; weapons: RawWeapon[]; items: RawEntry[]; consumables: RawEntry[]
}

const readPrototypeDatabase = (): RawDatabase => {
  const html = readFileSync(PROTOTYPE_PATH, "utf8")
  const match = html.match(/<script id="db" type="application\/json">([\s\S]*?)<\/script>/)

  if (!match) {
    throw new Error('Bloco <script id="db"> não encontrado em specs/dh-sw.html')
  }

  return JSON.parse(match[1]) as RawDatabase
}

/* ── limpeza ──────────────────────────────────────────────────────────── */

/**
 * Parte das cartas carrega o cabeçalho do export do Notion no corpo do texto.
 * DOMAIN.md registra isso como dívida do dado: some aqui, não na renderização.
 */
const stripNotionHeader = (text: string): string => {
  const lines = text.split("\n")
  const isHeaderLine = (line: string) =>
    /^#\s/.test(line) ||
    /^(Category|Domain|Level|Recall cost|Summary):/i.test(line)

  const body = lines.filter((line) => !isHeaderLine(line.trim()))
  const cleaned = body.join("\n").trim()

  // Algumas entradas só têm o cabeçalho; nesse caso o "Summary:" era o texto.
  if (cleaned) {
    return cleaned
  }

  const summary = lines.find((line) => /^Summary:/i.test(line.trim()))

  return summary ? summary.replace(/^Summary:\s*/i, "").trim() : text.trim()
}

/* ── invariantes: quebram o build, não a mesa ─────────────────────────── */

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(`Invariante do compêndio violada: ${message}`)
  }
}

const checkInvariants = (db: RawDatabase) => {
  const domainNames = db.domains.map((domain) => domain.n)
  assert(domainNames.length === 6, `esperados 6 domínios, achados ${domainNames.length}`)

  for (const domainName of domainNames) {
    const cards = db.skills.filter((skill) => skill.d === domainName)
    assert(cards.length === 21, `${domainName} tem ${cards.length} cartas, esperadas 21`)

    for (let level = 1; level <= 10; level += 1) {
      const expected = level === 1 ? 3 : 2
      const found = cards.filter((card) => card.l === level).length
      assert(found === expected, `${domainName} nível ${level}: ${found} cartas, esperadas ${expected}`)
    }
  }

  const domainSlots = db.classes.flatMap((klass) => klass.dom)
  assert(domainSlots.length === 12, `esperados 12 slots de domínio, achados ${domainSlots.length}`)

  for (const domainName of domainNames) {
    const uses = domainSlots.filter((slot) => slot === domainName).length
    assert(uses === 2, `${domainName} aparece em ${uses} classes, esperadas 2`)
  }

  for (const klass of db.classes) {
    assert(klass.dom.length === 2, `${klass.n} tem ${klass.dom.length} domínios, esperados 2`)
    assert(klass.sub.length === 2, `${klass.n} tem ${klass.sub.length} subclasses, esperadas 2`)
  }

  // Nenhum par de classes compartilha os dois domínios — garante que multiclasse
  // sempre deixe um terceiro domínio disponível. dh-sw-v2-spec.md §1.3
  for (const first of db.classes) {
    for (const second of db.classes) {
      if (first.n >= second.n) {
        continue
      }

      const shared = first.dom.filter((domain) => second.dom.includes(domain))
      assert(shared.length < 2, `${first.n} e ${second.n} compartilham os dois domínios`)
    }
  }

  for (const armor of db.armorNamed) {
    const line = db.armor.find((candidate) => candidate.l === armor.l)
    assert(Boolean(line), `armadura ${armor.n} referencia linha inexistente ${armor.l}`)
    assert(armor.t >= 1 && armor.t <= 4, `armadura ${armor.n} tem tier ${armor.t}`)
  }

  for (const subclass of db.subclasses) {
    const owner = db.classes.find((klass) => klass.n === subclass.cls)
    assert(Boolean(owner), `subclasse ${subclass.n} referencia classe inexistente ${subclass.cls}`)
  }

  // Nome é chave: DOMAIN.md fixa referência por nome, então não pode repetir.
  const assertUniqueNames = (label: string, names: string[]) => {
    const seen = new Set<string>()
    for (const name of names) {
      assert(!seen.has(name), `${label}: nome repetido "${name}"`)
      seen.add(name)
    }
  }

  assertUniqueNames("skills", db.skills.map((skill) => skill.n))
  assertUniqueNames("weapons", db.weapons.map((weapon) => weapon.n))
  assertUniqueNames("armorNamed", db.armorNamed.map((armor) => armor.n))
  assertUniqueNames("items", db.items.map((item) => item.n))
  assertUniqueNames("consumables", db.consumables.map((entry) => entry.n))
}

/* ── índice de busca, pré-computado ───────────────────────────────────── */

// Faixa de marcas de combinação do Unicode, escrita por código para continuar
// legível: um literal aqui seria um caractere invisível no editor.
const COMBINING_MARKS = new RegExp("[\\u0300-\\u036f]", "g")

const normalizeForSearch = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

/* ── emissão ──────────────────────────────────────────────────────────── */

const emit = (fileName: string, body: string) => {
  writeFileSync(join(OUTPUT_DIR, fileName), `${HEADER}${body}`, "utf8")
}

const serialize = (value: unknown): string => JSON.stringify(value, null, 2)

const build = () => {
  const db = readPrototypeDatabase()
  checkInvariants(db)
  mkdirSync(OUTPUT_DIR, { recursive: true })

  const skills = db.skills.map((skill) => ({
    name: skill.n,
    domain: skill.d,
    level: skill.l,
    recallCost: skill.r,
    category: skill.c,
    text: stripNotionHeader(skill.t),
  }))

  emit("skills.ts", [
    "import type { Skill } from \"@/types\"",
    "",
    `export const SKILLS: readonly Skill[] = ${serialize(skills)} as const`,
    "",
    "export const SKILL_SEARCH_INDEX: Readonly<Record<string, string>> =",
    `  ${serialize(Object.fromEntries(skills.map((skill) => [
      skill.name,
      normalizeForSearch(`${skill.name} ${skill.domain} ${skill.text}`),
    ])))}`,
    "",
  ].join("\n"))

  emit("domains.ts", [
    "import type { DomainDefinition } from \"@/types\"",
    "",
    `export const DOMAIN_DEFINITIONS: readonly DomainDefinition[] = ${serialize(
      db.domains.map((domain) => ({ name: domain.n, description: domain.desc })),
    )} as const`,
    "",
  ].join("\n"))

  emit("classes.ts", [
    "import type { ClassDefinition } from \"@/types\"",
    "",
    `export const CLASSES: readonly ClassDefinition[] = ${serialize(
      db.classes.map((klass) => ({
        name: klass.n,
        evasion: klass.ev,
        hitPoints: klass.hp,
        domains: klass.dom,
        subclasses: klass.sub,
        baseFeatures: klass.feat,
        hopeFeature: klass.hope,
        previousEvasion: klass.evOld ?? null,
        previousHopeFeature: klass.hopeOld ?? null,
        hopeFeatureRationale: klass.hopeWhy ?? null,
      })),
    )} as const`,
    "",
  ].join("\n"))

  const toFeatures = (features: RawFeature[]) =>
    features.map((feature) => ({ name: feature.n, text: feature.t }))

  emit("subclasses.ts", [
    "import type { Subclass } from \"@/types\"",
    "",
    `export const SUBCLASSES: readonly Subclass[] = ${serialize(
      db.subclasses.map((subclass) => ({
        name: subclass.n,
        className: subclass.cls,
        spellcastTrait: subclass.trait,
        foundation: toFeatures(subclass.f),
        specialization: toFeatures(subclass.s),
        mastery: toFeatures(subclass.m),
      })),
    )} as const`,
    "",
  ].join("\n"))

  emit("ancestries.ts", [
    "import type { Ancestry } from \"@/types\"",
    "",
    `export const ANCESTRIES: readonly Ancestry[] = ${serialize(
      db.ancestries.map((ancestry) => ({
        name: ancestry.n,
        description: ancestry.d,
        features: ancestry.f,
      })),
    )} as const`,
    "",
  ].join("\n"))

  emit("communities.ts", [
    "import type { Community } from \"@/types\"",
    "",
    `export const COMMUNITIES: readonly Community[] = ${serialize(
      db.communities.map((community) => ({
        name: community.n,
        description: community.d,
        feature: community.f,
      })),
    )} as const`,
    "",
  ].join("\n"))

  emit("armor.ts", [
    "import type { ArmorLine, NamedArmor } from \"@/types\"",
    "",
    `export const ARMOR_LINES: readonly ArmorLine[] = ${serialize(
      db.armor.map((line) => ({
        name: line.l,
        evasionLabel: line.ev,
        tiers: line.t.map(([baseScore, majorBase, severeBase]) => ({
          baseScore,
          majorBase,
          severeBase,
        })),
      })),
    )} as const`,
    "",
    `export const NAMED_ARMOR: readonly NamedArmor[] = ${serialize(
      db.armorNamed.map((armor) => ({
        name: armor.n,
        line: armor.l,
        tier: armor.t,
        feature: armor.f,
      })),
    )} as const`,
    "",
  ].join("\n"))

  emit("weapons.ts", [
    "import type { Weapon } from \"@/types\"",
    "",
    `export const WEAPONS: readonly Weapon[] = ${serialize(
      db.weapons.map((weapon) => ({
        name: weapon.n,
        trait: weapon.tr,
        range: weapon.rg,
        damageDie: weapon.die,
        bonusByTier: weapon.bon,
        damageType: weapon.dt,
        burden: weapon.b,
        feature: weapon.f,
        isIconic: Boolean(weapon.ic),
      })),
    )} as const`,
    "",
  ].join("\n"))

  const toEntries = (entries: RawEntry[]) =>
    entries.map((entry) => ({ name: entry.n, tier: entry.t, text: entry.txt }))

  emit("items.ts", [
    "import type { CompendiumEntry } from \"@/types\"",
    "",
    `export const ITEMS: readonly CompendiumEntry[] = ${serialize(toEntries(db.items))} as const`,
    "",
  ].join("\n"))

  emit("consumables.ts", [
    "import type { CompendiumEntry } from \"@/types\"",
    "",
    `export const CONSUMABLES: readonly CompendiumEntry[] = ${serialize(toEntries(db.consumables))} as const`,
    "",
  ].join("\n"))

  console.log([
    "compêndio gerado em src/compendium/",
    `  ${skills.length} cartas · ${db.classes.length} classes · ${db.subclasses.length} subclasses`,
    `  ${db.ancestries.length} espécies · ${db.communities.length} origens`,
    `  ${db.weapons.length} armas · ${db.armorNamed.length} armaduras · ${db.items.length} itens · ${db.consumables.length} consumíveis`,
    "  invariantes conferidas: OK",
  ].join("\n"))
}

build()
