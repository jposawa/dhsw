import type { CompendiumCollection } from "@/types"

/**
 * As coleções do compêndio, na ordem de `Compendium`. Um arquivo por coleção
 * em `data/`, e um nó por coleção em `/dhsw/<env>/compendium`.
 */
export const COMPENDIUM_COLLECTIONS: readonly CompendiumCollection[] = [
  "skills",
  "domains",
  "classes",
  "subclasses",
  "ancestries",
  "communities",
  "armorLines",
  "namedArmor",
  "weapons",
  "items",
  "consumables",
  "features",
  "augments",
  "downtimeMoves",
]
