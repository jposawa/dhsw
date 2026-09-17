import { useAtomValue } from "jotai"
import React from "react"

import { DEFAULT_HOME, NAV_ITEMS } from "@/constants"
import { resolveHomePath } from "@/helpers"
import { authAtom } from "@/states"

import { useConfig } from "./useConfig"

export type HomeRouteResult = {
  /** `true` enquanto a sessao esta sendo restaurada — nao decida ainda. */
  isResolving: boolean
  /** `null` quando nao ha destino servivel. Nao deve acontecer com o catalogo atual. */
  path: string | null
}

/**
 * Para onde `/` manda, por estado de sessao.
 *
 * Vem da config remota (`home.authenticated` / `home.anonymous`), com
 * fallback no codigo (`DEFAULT_HOME`). A resolucao e pura e testada em
 * `helpers/navigation.ts`; aqui so a ligacao com o estado.
 */
export const useHomeRoute = (): HomeRouteResult => {
  const { status } = useAtomValue(authAtom)
  const { config } = useConfig()

  const path = React.useMemo(
    () => resolveHomePath(NAV_ITEMS, config.home, DEFAULT_HOME, status === "signed-in"),
    [config.home, status],
  )

  return { isResolving: status === "unknown", path }
}
