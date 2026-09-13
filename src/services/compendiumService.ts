import { get } from "firebase/database"

import { FALLBACK_COMPENDIUM } from "@/compendium"
import { DB_PATHS } from "@/constants"
import { resolveCompendium, type ResolvedCompendium } from "@/helpers"
import { dhswRef } from "@/lib/firebase"

/**
 * Compêndio de `/dhsw/<env>/compendium`, com o JSON do repositório de fallback.
 *
 * Lido **uma vez** no boot, como a config: carta que muda de texto no meio da
 * sessão muda regra debaixo do pé de quem está jogando.
 */
export const fetchCompendium = async (): Promise<ResolvedCompendium> => {
  try {
    const snapshot = await get(dhswRef(DB_PATHS.compendium))
    const resolved = resolveCompendium(snapshot.val(), FALLBACK_COMPENDIUM)

    if (import.meta.env.DEV && resolved.rejected.length > 0) {
      console.warn(
        `Compêndio: coleções do banco recusadas pelo schema, usando o JSON: ${resolved.rejected.join(", ")}`,
      )
    }

    return resolved
  } catch {
    // Sem rede ou sem permissão: o compêndio embarcado é completo, e a mesa
    // não pode perceber a diferença.
    return resolveCompendium(null, FALLBACK_COMPENDIUM)
  }
}
