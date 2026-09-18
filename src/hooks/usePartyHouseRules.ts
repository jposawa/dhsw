import React from "react"

import { subscribePartyHouseRules } from "@/services"
import type { HouseRules } from "@/types"

type PartyRulesState = {
  partyId: string | null
  houseRules: HouseRules | null
}

/**
 * As regras da casa de uma mesa, ao vivo. `null` sem mesa, enquanto a primeira
 * leitura não chega, ou quando a mesa não tem regras gravadas.
 *
 * O estado guarda de qual mesa ele é: trocar de mesa não pode mostrar, nem por
 * um render, as regras da anterior.
 */
export const usePartyHouseRules = (partyId: string | null): HouseRules | null => {
  const [state, setState] = React.useState<PartyRulesState>({ partyId: null, houseRules: null })

  React.useEffect(() => {
    if (!partyId) {
      return
    }

    return subscribePartyHouseRules(partyId, (houseRules) => setState({ partyId, houseRules }))
  }, [partyId])

  return partyId && state.partyId === partyId ? state.houseRules : null
}
