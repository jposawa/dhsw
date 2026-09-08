/** Chaves e versoes do armazenamento local. A implementacao vive em `services/`. */

export const STORAGE_KEYS = {
  roster: 'dhsw:roster',
  houseRules: 'dhsw:houseRules',
  theme: 'dhsw:theme',
} as const

/** Versao do formato de cada chave. Sobe junto com a migracao correspondente. */
export const STORAGE_VERSIONS = {
  /** v2: `Character.partyId`. */
  roster: 2,
  houseRules: 1,
} as const

/** Versao do formato de uma ficha. Toda escrita — local ou remota — carrega isto. */
export const CHARACTER_SCHEMA_VERSION = 2
