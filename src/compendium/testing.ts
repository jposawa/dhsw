import type { Compendium, CompendiumCollection, DowntimeMove, Skill } from "@/types"

import { COMPENDIUM_COLLECTIONS } from "./collections"

/**
 * Compêndio **de teste**. Só entra nos testes; o app lê o compêndio do banco.
 *
 * O conteúdo real não é versionado (fica em `data/compendium/`, fora do git).
 * Aqui mora o mínimo que os testes de regra usam: os números que as regras
 * calculam — thresholds, Evasion, escalas de token, modificadores — e textos
 * de enfeite no lugar dos de verdade. Nome real só onde o teste o cita.
 *
 * `Compendium` na anotação, e não `as`: o compilador confere cada valor
 * fechado (domínio, atributo, alcance) deste arquivo.
 */

const TEXT = "Texto de teste."

const skill = (name: string, domain: Skill["domain"], level: Skill["level"], extra: Partial<Skill> = {}): Skill => ({
  name,
  domain,
  level,
  recallCost: 1,
  category: "Ability",
  text: TEXT,
  ...extra,
})

const halfTierRest = (name: string) =>
  ({ name, scale: "tier", isHalved: true, refill: "rest" }) as const

const downtime = (
  id: string,
  name: string,
  rest: DowntimeMove["rest"],
  effect: DowntimeMove["effect"],
): DowntimeMove => ({ id, name, rest, text: TEXT, effect })

export const TEST_COMPENDIUM: Compendium = {
  skills: [
    skill("Bare Bones", "Aegis", 1, { recallCost: 0 }),
    skill("Shield Up", "Aegis", 1),
    skill("Steady Hands", "Aegis", 2),
    skill("Refreshing Wind", "Aegis", 4, {
      tokens: [{ name: "Refreshing Wind", scale: "tier", refill: "rest" }],
    }),
    skill("Hold the Line", "Aegis", 9),
    skill("Burst Strike", "Havoc", 1),
    skill("Heavy Swing", "Havoc", 2),
    skill("Not Forgetting", "Allure", 8, { tokens: [{ name: "Not Forgetting", refill: "rest" }] }),
    skill("Lightning Reflexes", "Edge", 1),
    skill("Nimble", "Edge", 1),
    skill("Tech Savvy", "Edge", 9, {
      tokens: [{ name: "Tech Savvy", scale: "domainCards", domain: "Edge", refill: "longRest" }],
    }),
    skill("Cron of Simus", "Essence", 1, {
      category: "Holocron",
      tokens: [{ name: "Cron of Simus", scale: "tier", refill: "manual" }],
    }),
    skill("Cron of Surik", "Essence", 9, {
      category: "Holocron",
      text: `### Shared Feature\n${TEXT}\n### Bonded Skill\n${TEXT}`,
      tokens: [halfTierRest("Shared Feature"), halfTierRest("Bonded Skill")],
    }),
    skill("Quiet Step", "Veil", 1),
  ],
  domains: [
    { name: "Aegis", description: TEXT },
    { name: "Allure", description: TEXT },
    { name: "Edge", description: TEXT },
    { name: "Essence", description: TEXT },
    { name: "Havoc", description: TEXT },
    { name: "Veil", description: TEXT },
  ],
  classes: [
    {
      name: "Adept",
      evasion: 10,
      hitPoints: 6,
      domains: ["Essence", "Aegis"],
      subclasses: ["Warden"],
      features: [
        {
          name: "Determination Dice",
          text: TEXT,
          tokens: { scale: "forcewield", maxAtLeast: 1, refill: "longRest" },
        },
      ],
      hopeFeature: TEXT,
    },
    {
      name: "Soldier",
      evasion: 9,
      hitPoints: 7,
      domains: ["Aegis", "Havoc"],
      subclasses: ["Juggernaut"],
      features: [
        { name: "Implacable", text: TEXT, tokens: { scale: "tier", isHalved: true, refill: "longRest" } },
        { name: "Combat Training", text: TEXT },
      ],
      hopeFeature: TEXT,
    },
    {
      name: "Agent",
      evasion: 12,
      hitPoints: 6,
      domains: ["Edge", "Veil"],
      subclasses: [],
      features: [{ name: "Hide", text: TEXT }],
      hopeFeature: TEXT,
    },
    {
      name: "Conduit",
      evasion: 10,
      hitPoints: 5,
      domains: ["Essence", "Havoc"],
      subclasses: ["Wayseeker"],
      features: [{ name: "Raw Channel", text: TEXT }],
      hopeFeature: TEXT,
    },
  ],
  subclasses: [
    {
      name: "Warden",
      className: "Adept",
      spellcastTrait: "Knowledge",
      foundation: [{ name: "Guard Stance", text: TEXT }],
      specialization: [{ name: "Force Riposte", text: TEXT }],
      mastery: [{ name: "Defensive Shell", text: TEXT }],
    },
    {
      name: "Juggernaut",
      className: "Soldier",
      spellcastTrait: null,
      foundation: [
        {
          name: "Defensive Layer I",
          text: TEXT,
          modifiers: [
            { target: "majorThreshold", value: 1 },
            { target: "severeThreshold", value: 1 },
          ],
        },
      ],
      specialization: [
        {
          name: "Defensive Layer II",
          text: TEXT,
          modifiers: [
            { target: "majorThreshold", value: 2 },
            { target: "severeThreshold", value: 2 },
          ],
        },
      ],
      // Vazio de propósito: o banco apaga lista vazia, e a leitura tem que devolvê-la.
      mastery: [],
    },
    {
      name: "Wayseeker",
      className: "Conduit",
      spellcastTrait: "Instinct",
      foundation: [{ name: "Force Roots", text: TEXT }],
      specialization: [],
      mastery: [
        { name: "Hardened", text: TEXT, modifiers: [{ target: "severeThreshold", value: 4 }] },
      ],
    },
  ],
  ancestries: [
    {
      name: "Human",
      description: TEXT,
      // O nome em **negrito** é o que liga a feature ao modificador dela.
      features: [`**High Stamina** — ${TEXT}`, `**Adaptability** — ${TEXT}`],
      modifiers: [{ feature: "High Stamina", target: "stressMax", value: 1 }],
    },
    {
      name: "Twilek",
      description: TEXT,
      features: [`**Lekku Read** — ${TEXT}`, `**Heat Adapted** — ${TEXT}`],
      modifiers: [
        { feature: "Lekku Read", target: "trait.Presence", value: 1 },
        { feature: "Heat Adapted", target: "evasion", value: 1 },
      ],
    },
  ],
  communities: [{ name: "Underborne", description: TEXT, feature: TEXT }],
  armorLines: [
    {
      name: "Flexible",
      feature: "Flexible",
      tiers: [
        { baseScore: 3, majorBase: 5, severeBase: 11 },
        { baseScore: 4, majorBase: 7, severeBase: 16 },
        { baseScore: 5, majorBase: 9, severeBase: 23 },
        { baseScore: 6, majorBase: 11, severeBase: 32 },
      ],
    },
    {
      name: "Neutra",
      feature: null,
      tiers: [
        { baseScore: 3, majorBase: 6, severeBase: 13 },
        { baseScore: 4, majorBase: 9, severeBase: 20 },
        { baseScore: 5, majorBase: 11, severeBase: 27 },
        { baseScore: 6, majorBase: 13, severeBase: 36 },
      ],
    },
    {
      name: "Heavy",
      feature: "Heavy",
      tiers: [
        { baseScore: 4, majorBase: 7, severeBase: 15 },
        { baseScore: 5, majorBase: 11, severeBase: 24 },
        { baseScore: 6, majorBase: 13, severeBase: 31 },
        { baseScore: 7, majorBase: 15, severeBase: 40 },
      ],
    },
    {
      name: "Very Heavy",
      feature: "Very Heavy",
      tiers: [
        { baseScore: 4, majorBase: 8, severeBase: 17 },
        { baseScore: 5, majorBase: 13, severeBase: 28 },
        { baseScore: 6, majorBase: 15, severeBase: 35 },
        { baseScore: 7, majorBase: 17, severeBase: 44 },
      ],
    },
  ],
  namedArmor: [
    { name: "Scout Mesh", line: "Flexible", tier: 1, feature: null },
    { name: "Smuggler's Vest", line: "Neutra", tier: 1, feature: null },
    { name: "Hunter's Rig", line: "Neutra", tier: 3, feature: null },
    { name: "Trooper Plate", line: "Heavy", tier: 1, feature: null },
    { name: "Siege Carapace", line: "Very Heavy", tier: 1, feature: null },
  ],
  weapons: [
    {
      name: "Blaster",
      trait: "Finesse",
      range: "Far",
      damageDie: "d8",
      bonusByTier: [3, 5, 7, 10],
      damageType: "tech",
      damageKind: "energy",
      burden: "Uma mão",
      feature: null,
      customizable: null,
    },
    {
      name: "Blaster Pistol",
      trait: "Finesse",
      range: "Far",
      damageDie: "d6",
      bonusByTier: [3, 5, 7, 10],
      damageType: "tech",
      damageKind: "energy",
      burden: "Uma mão",
      feature: null,
      customizable: 1,
    },
    {
      name: "Blaster Rifle",
      trait: "Finesse",
      range: "Very Far",
      damageDie: "d10",
      bonusByTier: [3, 6, 9, 12],
      damageType: "tech",
      damageKind: "energy",
      burden: "Duas mãos",
      feature: null,
      customizable: 1,
    },
    {
      name: "Vibroblade",
      trait: "Agility",
      range: "Melee",
      damageDie: "d8",
      bonusByTier: [3, 5, 7, 10],
      damageType: "phy",
      damageKind: "physical",
      burden: "Uma mão",
      feature: null,
      customizable: 1,
    },
    {
      name: "Vibroknife",
      trait: "Finesse",
      range: "Melee",
      damageDie: "d8",
      bonusByTier: [0, 2, 4, 6],
      damageType: "phy",
      damageKind: "physical",
      burden: "Secundária",
      feature: null,
      customizable: 1,
    },
    {
      name: "Riot Shield",
      trait: "Strength",
      range: "Melee",
      damageDie: "d4",
      bonusByTier: [0, 2, 4, 6],
      damageType: "phy",
      damageKind: "physical",
      burden: "Secundária",
      feature: "Protective",
      customizable: 1,
    },
    {
      name: "Combat Staff",
      trait: "Instinct",
      range: "Melee",
      damageDie: "d8",
      bonusByTier: [1, 3, 5, 7],
      damageType: "phy",
      damageKind: "physical",
      burden: "Duas mãos",
      feature: "Guarding",
      customizable: 1,
    },
  ],
  items: [{ name: "Corda", tier: 1, text: TEXT }],
  consumables: [{ name: "Medpac", tier: 1, text: TEXT }],
  features: [
    { name: "Flexible", text: TEXT, modifiers: [{ target: "evasion", value: 1 }] },
    { name: "Heavy", text: TEXT, modifiers: [{ target: "evasion", value: -1 }] },
    {
      name: "Very Heavy",
      text: TEXT,
      modifiers: [
        { target: "evasion", value: -2 },
        { target: "trait.Agility", value: -1 },
      ],
    },
    { name: "Protective", text: TEXT, modifiers: [{ target: "armorScore", valueByTier: [1, 2, 3, 4] }] },
    { name: "Guarding", text: TEXT, modifiers: [{ target: "evasion", value: 1 }] },
  ],
  augments: [
    { name: "Overcharged Cell", tier: 1, text: TEXT, damageBonus: 1 },
    { name: "Amplifier", tier: 1, text: TEXT },
    { name: "Guard Plating", tier: 1, text: TEXT, modifiers: [{ target: "armorScore", value: 1 }] },
    { name: "Targeting Array", tier: 1, text: TEXT, attackBonus: 1 },
    { name: "Deflector Emitter", tier: 1, text: TEXT, modifiers: [{ target: "armorScore", value: 2 }] },
    { name: "Superheated Core", tier: 2, text: TEXT, damageBonus: 2 },
  ],
  downtimeMoves: [
    downtime("tendToWounds", "Tend to Wounds", "short", {
      kind: "clearRolled",
      marker: "hp",
      dice: "1d4",
      canTargetAlly: true,
    }),
    downtime("clearStress", "Clear Stress", "short", {
      kind: "clearRolled",
      marker: "stress",
      dice: "1d4",
      canTargetAlly: false,
    }),
    downtime("repairArmor", "Repair Armor", "short", {
      kind: "clearRolled",
      marker: "armor",
      dice: "1d4",
      canTargetAlly: true,
    }),
    downtime("prepareShort", "Prepare", "short", { kind: "gainHope", amount: 1, withPartyAmount: 2 }),
    downtime("tendToAllWounds", "Tend to All Wounds", "long", {
      kind: "clearAll",
      marker: "hp",
      canTargetAlly: true,
    }),
    downtime("clearAllStress", "Clear All Stress", "long", {
      kind: "clearAll",
      marker: "stress",
      canTargetAlly: false,
    }),
    downtime("repairAllArmor", "Repair All Armor", "long", {
      kind: "clearAll",
      marker: "armor",
      canTargetAlly: true,
    }),
    downtime("prepareLong", "Prepare", "long", { kind: "gainHope", amount: 1, withPartyAmount: 2 }),
    downtime("workOnProject", "Work on a Project", "long", { kind: "narrative" }),
  ],
}

/**
 * O compêndio real, de `data/compendium/` — só na máquina de quem tem a pasta,
 * que não é versionada. `null` sem ela (no CI, por exemplo): os testes que
 * conferem o conteúdo real se pulam.
 *
 * `import.meta.glob` e não `fs`: é o Vite que resolve, e pasta ausente só
 * devolve nada.
 */
const localFiles = import.meta.glob<unknown>("/data/compendium/*.json", {
  eager: true,
  import: "default",
})

const localCollection = (collection: CompendiumCollection) =>
  localFiles[`/data/compendium/${collection}.json`]

export const LOCAL_COMPENDIUM: Compendium | null = COMPENDIUM_COLLECTIONS.every(
  (collection) => localCollection(collection) !== undefined,
)
  ? (Object.fromEntries(
      COMPENDIUM_COLLECTIONS.map((collection) => [collection, localCollection(collection)]),
    ) as Compendium)
  : null
