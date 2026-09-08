import { useAtomValue } from 'jotai'
import React from 'react'

import { fetchPartiesForUser } from '@/services'
import { authAtom } from '@/states'
import type { PartyWithRole } from '@/types'

export type UsePartiesResult = {
  parties: PartyWithRole[]
  isLoading: boolean
  /** Rebusca depois de criar, entrar ou sair — a lista muda por ação, não sozinha. */
  refresh: () => void
}

/**
 * As parties que este jogador alcança.
 *
 * Busca sob demanda, não em atom persistido: party é dado de outras pessoas
 * também, e guardar cópia local abriria a mesma pergunta de conflito que a
 * ficha tem — sem o motivo que a justifica lá, que é jogar sem rede.
 */
export const useParties = (): UsePartiesResult => {
  const { user } = useAtomValue(authAtom)
  const [parties, setParties] = React.useState<PartyWithRole[]>([])
  // Comeca em `true`: o efeito nao pode ligar isto de forma sincrona no corpo
  // dele, e o primeiro render e mesmo de carregamento.
  const [isLoading, setIsLoading] = React.useState(true)
  const [reloadToken, setReloadToken] = React.useState(0)

  React.useEffect(() => {
    if (!user) {
      return
    }

    let isCancelled = false

    void fetchPartiesForUser(user.userId)
      .then((result) => {
        if (!isCancelled) {
          setParties(result)
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setParties([])
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [user, reloadToken])

  return {
    // Derivado em vez de limpo por efeito: sem sessao nao ha parties, e zerar
    // o estado num efeito so criaria um render a mais para dizer o mesmo.
    parties: user ? parties : [],
    isLoading,
    // Chamado de handler, nao de efeito: aqui ligar o carregamento e legitimo.
    refresh: () => {
      setIsLoading(true)
      setReloadToken((token) => token + 1)
    },
  }
}
