import { useAtomValue } from "jotai"

import { DEFAULT_HOUSE_RULES } from "@/constants"
import { derive, effectiveHouseRules } from "@/helpers"
import { rosterAtom, sheetRolesAtom } from "@/states"
import type { Character, DerivedStats, HouseRules } from "@/types"

import { useCompendium } from "./useCompendium"
import { usePartyHouseRules } from "./usePartyHouseRules"

type UseSheetResult = {
  /** A ficha guardada, ou `undefined` se este id não existe no roster. */
  character: Character | undefined
  /** Quem só lê não salva nada. Papel ausente = ficha local, e ela é sua. */
  isReadOnly: boolean
  /** As regras que valem para esta ficha: as da mesa, se ela estiver numa. */
  houseRules: HouseRules
  /** `undefined` junto com `character` — sem ficha não há o que derivar. */
  derived: DerivedStats | undefined
}

/**
 * Tudo o que uma tela precisa para mostrar uma ficha, montado uma vez.
 *
 * As quatro coisas sempre andam juntas e nenhuma se lê sozinha: os números
 * dependem das regras, as regras dependem da mesa, e o papel decide se dá para
 * salvar. Cada tela juntando isso na mão faria a segunda divergir da primeira
 * no dia em que a regra de mesa mudasse.
 *
 * **`derive` continua função pura** e fora daqui: este hook só busca o que ela
 * precisa. É o que mantém a matemática testável sem montar componente.
 *
 * Com uma ficha em rascunho — o modo edição —, passe o rascunho em
 * `overCharacter`: os números acompanham o que se está mexendo, antes de
 * salvar, que é a razão de a tela de edição existir.
 */
export const useSheet = (
  sheetId: string | undefined,
  overCharacter?: Character | null,
): UseSheetResult => {
  const roster = useAtomValue(rosterAtom)
  const sheetRoles = useAtomValue(sheetRolesAtom)
  const { compendium } = useCompendium()

  const stored = sheetId ? roster.characters[sheetId] : undefined
  const character = overCharacter ?? stored

  // Antes de qualquer retorno: hook não pode ficar atrás de condição.
  const partyRules = usePartyHouseRules(character?.partyId ?? null)

  // Sem ficha não há regra de ficha: vale o padrão, para quem chama não ter
  // de tratar `undefined` num campo que nunca é opcional na tela.
  const houseRules = character ? effectiveHouseRules(character, partyRules) : DEFAULT_HOUSE_RULES

  return {
    character: stored,
    isReadOnly: sheetId ? sheetRoles[sheetId] === "reader" : false,
    houseRules,
    derived: character && derive(character, houseRules, compendium),
  }
}
