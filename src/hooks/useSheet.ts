import { useAtomValue } from "jotai"
import React from "react"

import { DEFAULT_HOUSE_RULES } from "@/constants"
import { derive, effectiveHouseRules } from "@/helpers"
import { fetchSheet } from "@/services"
import { rosterAtom, sheetRolesAtom } from "@/states"
import type { Character, DerivedStats, HouseRules } from "@/types"

import { useCompendium } from "./useCompendium"
import { usePartyHouseRules } from "./usePartyHouseRules"

type UseSheetResult = {
  /** A ficha guardada, ou `undefined` se este id não existe no roster. */
  character: Character | undefined
  /** Quem só lê não salva nada. Papel ausente = ficha local, e ela é sua. */
  isReadOnly: boolean
  /** Buscando a ficha no banco — ficha de outra pessoa, aberta pela mesa. */
  isLoading: boolean
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
 *
 * **Ficha que não está no roster é lida do banco, e só de leitura.** É o
 * Narrador abrindo a ficha de um jogador pela lista da mesa: ficha de terceiro
 * nunca entra no roster local — se entrasse, a sincronização passaria a
 * empurrar ficha alheia como se fosse dele —, então ela vive aqui, no estado
 * desta tela, e some ao sair. Sem papel de escrita, nada nela se salva.
 */
export const useSheet = (
  sheetId: string | undefined,
  overCharacter?: Character | null,
): UseSheetResult => {
  const roster = useAtomValue(rosterAtom)
  const sheetRoles = useAtomValue(sheetRolesAtom)
  const { compendium } = useCompendium()

  const stored = sheetId ? roster.characters[sheetId] : undefined

  /**
   * O que a leitura trouxe, **com o id de quem ela foi**. Guardar a ficha
   * sozinha obrigaria a limpá-la ao trocar de rota, e limpar estado dentro de
   * um efeito é o que faz a tela piscar a ficha anterior na rota seguinte.
   */
  const [remote, setRemote] = React.useState<{
    sheetId: string
    character: Character | null
  } | null>(null)

  const isFetched = Boolean(sheetId) && remote?.sheetId === sheetId
  const isLoading = Boolean(sheetId) && !stored && !isFetched

  React.useEffect(() => {
    if (!sheetId || stored) {
      return
    }

    // `alive`: trocar de ficha antes de a leitura voltar não pode pôr a
    // anterior na tela da seguinte.
    let alive = true

    void fetchSheet(sheetId)
      .then((found) => {
        if (alive) {
          setRemote({ sheetId, character: found })
        }
      })
      // Sem acesso, ou sem rede: a tela trata como ficha que não existe.
      .catch(() => {
        if (alive) {
          setRemote({ sheetId, character: null })
        }
      })

    return () => {
      alive = false
    }
  }, [sheetId, stored])

  const saved = stored ?? (isFetched ? remote?.character ?? undefined : undefined)
  const character = overCharacter ?? saved

  // Antes de qualquer retorno: hook não pode ficar atrás de condição.
  const partyRules = usePartyHouseRules(character?.partyId ?? null)

  // Sem ficha não há regra de ficha: vale o padrão, para quem chama não ter
  // de tratar `undefined` num campo que nunca é opcional na tela.
  const houseRules = character ? effectiveHouseRules(character, partyRules) : DEFAULT_HOUSE_RULES

  return {
    character: saved,
    // Ficha que veio do banco é sempre leitura: o que dá direito de escrever é
    // o papel, e papel de ficha alheia esta tela não tem.
    isReadOnly: stored ? sheetRoles[stored.id] === "reader" : true,
    isLoading,
    houseRules,
    derived: character && derive(character, houseRules, compendium),
  }
}
