import { useAtomValue, useSetAtom } from "jotai"
import React from "react"

import { createRollRecord } from "@/helpers"
import {
  fetchProfile,
  prunePartyRolls,
  pushPartyRoll,
  subscribePartyRolls,
} from "@/services"
import { authAtom, toastAtom } from "@/states"
import type { RollRecord, RollResult, RollVisibility } from "@/types"

type RollOptions = {
  visibility?: RollVisibility
  sheet?: { id: string; name: string } | null
}

export type UsePartyRollsResult = {
  /** Da mais nova para a mais antiga; as do Narrador junto, para quem é. */
  rolls: RollRecord[]
  roll: (result: RollResult, options?: RollOptions) => void
}

type RollsState = {
  key: string
  publicRolls: RollRecord[]
  gmRolls: RollRecord[]
}

/**
 * O histórico de rolagens de uma mesa, ao vivo, e o gesto de rolar nela.
 *
 * Ao abrir, limpa o que passou do limite — qualquer membro, sem ação de
 * ninguém. O nó do Narrador só é assinado por quem é Narrador (`includeGm`).
 */
export const usePartyRolls = (partyId: string | null, includeGm: boolean): UsePartyRollsResult => {
  const { user } = useAtomValue(authAtom)
  const setToast = useSetAtom(toastAtom)
  const key = `${partyId ?? ""}:${includeGm}`
  const [state, setState] = React.useState<RollsState>({ key, publicRolls: [], gmRolls: [] })
  const [authorName, setAuthorName] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!partyId) {
      return
    }

    void prunePartyRolls(partyId, "public").catch(() => undefined)

    const unsubscribers = [
      subscribePartyRolls(partyId, "public", (publicRolls) =>
        setState((current) => ({
          key,
          publicRolls,
          gmRolls: current.key === key ? current.gmRolls : [],
        })),
      ),
    ]

    if (includeGm) {
      void prunePartyRolls(partyId, "gm").catch(() => undefined)
      unsubscribers.push(
        subscribePartyRolls(partyId, "gm", (gmRolls) =>
          setState((current) => ({
            key,
            publicRolls: current.key === key ? current.publicRolls : [],
            gmRolls,
          })),
        ),
      )
    }

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe())
  }, [partyId, includeGm, key])

  // O nome na mesa é o do perfil, não o do Google — é o que a pessoa escolheu.
  React.useEffect(() => {
    if (!user) {
      return
    }

    let isCancelled = false

    void fetchProfile(user.userId)
      .then((profile) => {
        if (!isCancelled) {
          setAuthorName(profile?.displayName ?? null)
        }
      })
      .catch(() => undefined)

    return () => {
      isCancelled = true
    }
  }, [user])

  const current = state.key === key ? state : { publicRolls: [], gmRolls: [] }
  const rolls = [...current.publicRolls, ...current.gmRolls].sort(
    (left, right) => right.createdAt - left.createdAt,
  )

  const roll = (result: RollResult, options: RollOptions = {}) => {
    if (!partyId || !user) {
      return
    }

    const record = createRollRecord(result, {
      author: { userId: user.userId, name: authorName ?? user.displayName },
      sheet: options.sheet ?? null,
      visibility: options.visibility ?? "public",
    })

    void pushPartyRoll(partyId, record).catch(() => setToast("A rolagem não chegou à mesa."))
  }

  return { rolls, roll }
}
