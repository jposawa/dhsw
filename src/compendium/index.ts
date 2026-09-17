/**
 * O compêndio do app vem **só do banco**: `services/compendiumService.ts` lê
 * `/dhsw/<env>/compendium` depois do login.
 *
 * O conteúdo não é versionado nem vai no bundle — o repositório é público. A
 * fonte editável fica em `data/compendium/` (fora do git), um JSON por coleção,
 * e chega ao banco por `pnpm export:database`. Os testes usam o compêndio de
 * `./testing`, que não entra no app.
 *
 * Sem cache local de propósito: compêndio velho guardado no navegador é regra
 * velha na mesa, sem ninguém perceber.
 */
import type { Compendium } from "@/types"

export { COMPENDIUM_COLLECTIONS } from "./collections"

/** Antes do banco responder, ou sem acesso a ele: nenhuma entrada. */
export const EMPTY_COMPENDIUM: Compendium = {
  skills: [],
  domains: [],
  classes: [],
  subclasses: [],
  ancestries: [],
  communities: [],
  armorLines: [],
  namedArmor: [],
  weapons: [],
  items: [],
  consumables: [],
  features: [],
  augments: [],
  downtimeMoves: [],
}
