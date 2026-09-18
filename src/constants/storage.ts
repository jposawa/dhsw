/** Chaves e versoes do armazenamento local. A implementacao vive em `services/`. */

export const STORAGE_KEYS = {
  roster: "dhsw:roster",
  houseRules: "dhsw:houseRules",
  theme: "dhsw:theme",
  navCollapsed: "dhsw:navCollapsed",
  compendiumView: "dhsw:compendiumView",
  rollHistory: "dhsw:rollHistory",
} as const

/** Versao do formato de cada chave. Sobe junto com a migracao correspondente. */
export const STORAGE_VERSIONS = {
  /** v2: `Character.partyId`. v3: `Character.tokens`. v4: `Character.houseRules`. v5: ascendência mista. v6: `Character.heritage`, com código, nome e a espécie de cada feature. */
  roster: 6,
  /** v2: multiclasse no Tier 2, tipos de dano granulares, armas customizáveis. */
  houseRules: 2,
  rollHistory: 1,
} as const

/** Versao do formato de uma ficha. Toda escrita — local ou remota — carrega isto. */
export const CHARACTER_SCHEMA_VERSION = 6
