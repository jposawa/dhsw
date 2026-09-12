import { useAtomValue, useStore } from "jotai"
import React from "react"

import { fetchCompendium } from "@/services"
import { compendiumAtom, compendiumStatusAtom } from "@/states"
import type { Compendium, ConfigStatus } from "@/types"

export type UseCompendiumOptions = {
  /** Busca no banco ao montar. **Só o `App` liga isto** — ver `useConfig`. */
  initialFetch?: boolean
}

export type UseCompendiumResult = {
  /** Nunca vazio: começa no JSON do repositório. */
  compendium: Compendium
  status: ConfigStatus
}

/**
 * Compêndio: leitura e carga num hook só, no mesmo desenho de `useConfig`.
 *
 * Tela nenhuma importa `@/compendium` direto — lê daqui, e recebe o conteúdo
 * do banco assim que ele chega.
 */
export const useCompendium = ({
  initialFetch = false,
}: UseCompendiumOptions = {}): UseCompendiumResult => {
  const compendium = useAtomValue(compendiumAtom)
  const status = useAtomValue(compendiumStatusAtom)
  const store = useStore()

  React.useEffect(() => {
    if (!initialFetch || store.get(compendiumStatusAtom) !== "default") {
      return
    }

    store.set(compendiumStatusAtom, "loading")
    let isCancelled = false

    void fetchCompendium()
      .then((resolved) => {
        if (!isCancelled) {
          store.set(compendiumAtom, resolved.compendium)
          store.set(compendiumStatusAtom, "loaded")
        }
      })
      .catch(() => {
        if (!isCancelled) {
          store.set(compendiumStatusAtom, "error")
        }
      })

    return () => {
      isCancelled = true
    }
  }, [initialFetch, store])

  return { compendium, status }
}
