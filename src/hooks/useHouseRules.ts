import { useAtomValue } from "jotai"
import React from "react"

import { houseRulesAtom } from "@/states"
import type { HouseRules } from "@/types"

/**
 * As regras da casa da ficha aberta, para os painéis dela.
 *
 * A ficha decide quais valem (as dela, ou as da mesa) e as põe aqui; painel
 * nenhum precisa saber de onde vieram. Fora de uma ficha — o compêndio, por
 * exemplo — vale o modelo do perfil.
 */
export const HouseRulesContext = React.createContext<HouseRules | null>(null)

export const useHouseRules = (): HouseRules => {
  const sheetRules = React.useContext(HouseRulesContext)
  const template = useAtomValue(houseRulesAtom)

  return sheetRules ?? template
}
