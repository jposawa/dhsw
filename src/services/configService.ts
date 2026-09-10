import { get } from "firebase/database"

import { DB_PATHS, DEFAULT_CONFIG } from "@/constants"
import { dhswRef } from "@/lib/firebase"
import type { RemoteConfig } from "@/types"

/**
 * Config remota, de `/dhsw/<env>/config`.
 *
 * Lida UMA vez no boot, não com `onValue`: config que muda no meio da sessão
 * muda regra debaixo do pé de quem está jogando. Ver CONFIG.md.
 */

/**
 * Merge com o default, um nível a mais em `home`.
 *
 * Raso não serve para `home`: uma config que traga só `{ home: { anonymous } }`
 * apagaria `authenticated` junto, e a home de quem entrou cairia no degrau
 * seguinte sem ninguém ter pedido isso. `menuItems` é o contrário — ele é um
 * mapa de overrides, e substituir inteiro é o comportamento certo.
 */
const mergeWithDefaults = (remote: Partial<RemoteConfig>): RemoteConfig => ({
  ...DEFAULT_CONFIG,
  ...remote,
  home: { ...DEFAULT_CONFIG.home, ...(remote.home ?? {}) },
})

export const fetchRemoteConfig = async (): Promise<RemoteConfig> => {
  try {
    const snapshot = await get(dhswRef(DB_PATHS.config))

    return mergeWithDefaults((snapshot.val() as Partial<RemoteConfig> | null) ?? {})
  } catch {
    // O único catch que engole erro no app inteiro, e é deliberado: falha de
    // config não pode aparecer para quem está na mesa.
    return DEFAULT_CONFIG
  }
}
