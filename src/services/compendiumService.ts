import { get } from "firebase/database"

import { DB_PATHS } from "@/constants"
import { resolveCompendium, type ResolvedCompendium } from "@/helpers"
import { dhswRef } from "@/lib/firebase"

/**
 * Compêndio de `/dhsw/<env>/compendium`, e só dele.
 *
 * Lido **uma vez** no boot, como a config: carta que muda de texto no meio da
 * sessão muda regra debaixo do pé de quem está jogando.
 *
 * Falha de rede sobe como erro: sem JSON de reserva, a tela precisa saber que
 * o compêndio não veio, em vez de mostrar listas vazias como se fossem o jogo.
 */
export const fetchCompendium = async (): Promise<ResolvedCompendium> => {
  const snapshot = await get(dhswRef(DB_PATHS.compendium))
  const resolved = resolveCompendium(snapshot.val())

  if (import.meta.env.DEV && resolved.rejected.length > 0) {
    console.warn(`Compêndio: coleções do banco recusadas: ${resolved.rejected.join(", ")}`)
  }

  return resolved
}
