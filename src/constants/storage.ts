/** Chaves e versoes do armazenamento local. A implementacao vive em `services/`. */

export const STORAGE_KEYS = {
  roster: "dhsw:roster",
  houseRules: "dhsw:houseRules",
  theme: "dhsw:theme",
  navCollapsed: "dhsw:navCollapsed",
  compendiumView: "dhsw:compendiumView",
} as const

/** Versao do formato de cada chave. Sobe junto com a migracao correspondente. */
export const STORAGE_VERSIONS = {
  /** v2: `Character.partyId`. */
  roster: 2,
  /** v2: multiclasse no Tier 2, tipos de dano granulares, armas customizáveis. */
  houseRules: 2,
} as const

/** Versao do formato de uma ficha. Toda escrita — local ou remota — carrega isto. */
export const CHARACTER_SCHEMA_VERSION = 2
