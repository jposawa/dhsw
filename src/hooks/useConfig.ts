import { useAtomValue, useStore } from 'jotai'
import React from 'react'

import { fetchRemoteConfig } from '@/services'
import { configStatusAtom, remoteConfigAtom } from '@/states'
import type { ConfigStatus, RemoteConfig } from '@/types'

export type UseConfigOptions = {
  /**
   * Busca a config remota ao montar. **Só o `App` liga isto.**
   *
   * Padrão `false` porque leitura é o caso comum: qualquer componente pode
   * chamar `useConfig()` sem custo de rede. Fosse o contrário, cada leitura
   * viraria um fetch.
   */
  initialFetch?: boolean
}

export type UseConfigResult = {
  /** Nunca `undefined`: começa no padrão do código, válido desde o 1º render. */
  config: RemoteConfig
  status: ConfigStatus
}

/**
 * Config remota: leitura e carga, num hook só.
 *
 * `useConfig()` lê. `useConfig({ initialFetch: true })` lê e, na primeira
 * chamada da aplicação, busca. O resultado vai para um atom, então quem já
 * estava lendo recebe o valor novo sem pedir nada.
 *
 * **Uma busca só, garantida por `configStatusAtom`.** Dois chamadores com
 * `initialFetch`, ou o StrictMode montando o efeito duas vezes, não viram
 * duas leituras.
 *
 * **Não expõe `refetch` de propósito.** A config é lida uma vez no boot e não
 * é assinada com `onValue`: config que muda no meio de uma sessão muda regra
 * debaixo do pé de quem está jogando (`CONFIG.md`). Se um recarregamento
 * manual fizer falta um dia, é aqui que ele entra — disparado por gesto de
 * pessoa, nunca por timer.
 */
export const useConfig = ({ initialFetch = false }: UseConfigOptions = {}): UseConfigResult => {
  const config = useAtomValue(remoteConfigAtom)
  const status = useAtomValue(configStatusAtom)

  // O store lê e escreve o status de forma síncrona, sem passar por closure.
  // Com `status` capturado do render, as duas montagens do StrictMode veriam
  // 'default' e as duas buscariam.
  const store = useStore()

  React.useEffect(() => {
    if (!initialFetch || store.get(configStatusAtom) !== 'default') {
      return
    }

    store.set(configStatusAtom, 'loading')
    let isCancelled = false

    void fetchRemoteConfig()
      .then((remote) => {
        if (!isCancelled) {
          store.set(remoteConfigAtom, remote)
          store.set(configStatusAtom, 'loaded')
        }
      })
      .catch(() => {
        // `fetchRemoteConfig` já engole falha de rede e devolve o padrão, então
        // chegar aqui significa defeito nosso. O `catch` existe para o status
        // não ficar preso em 'loading' para sempre — e nada na tela muda,
        // porque o padrão do código continua valendo.
        if (!isCancelled) {
          store.set(configStatusAtom, 'error')
        }
      })

    return () => {
      isCancelled = true
    }
  }, [initialFetch, store])

  return { config, status }
}
