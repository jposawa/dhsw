/**
 * O compêndio embarcado: o JSON de `data/`, que é o fallback do banco.
 *
 * **A fonte editável é o JSON.** Carta, classe, espécie ou arma se muda lá, em
 * um arquivo por coleção, e o mesmo arquivo é o que se importa no Realtime
 * Database. Em runtime quem manda é o banco — `services/compendiumService.ts`
 * lê `/dhsw/<env>/compendium` e só cai aqui na coleção que falta ou não valida.
 *
 * Por isso nada fora de `services/`, `states/` e dos testes importa daqui
 * direto: tela lê de `useCompendium`, regra recebe o compêndio por parâmetro.
 */
import type { Compendium } from "@/types"

import ancestries from "./data/ancestries.json"
import armorLines from "./data/armorLines.json"
import classes from "./data/classes.json"
import communities from "./data/communities.json"
import consumables from "./data/consumables.json"
import domains from "./data/domains.json"
import downtimeMoves from "./data/downtimeMoves.json"
import items from "./data/items.json"
import namedArmor from "./data/namedArmor.json"
import skills from "./data/skills.json"
import subclasses from "./data/subclasses.json"
import weapons from "./data/weapons.json"

export { COMPENDIUM_COLLECTIONS, COMPENDIUM_SCHEMAS } from "./schema"

/**
 * `as Compendium` porque import de JSON não estreita união literal ("Aegis"
 * vira `string`). A garantia não é o cast: é `compendium.test.ts`, que passa
 * cada arquivo pelo mesmo schema do banco.
 */
export const FALLBACK_COMPENDIUM = {
  skills,
  domains,
  classes,
  subclasses,
  ancestries,
  communities,
  armorLines,
  namedArmor,
  weapons,
  items,
  consumables,
  downtimeMoves,
} as Compendium
