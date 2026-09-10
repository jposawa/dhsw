import { atom } from "jotai"

import { DEFAULT_CONFIG } from "@/constants"
import type { ConfigStatus, RemoteConfig } from "@/types"

/**
 * Config remota. Comeca no default do codigo e e sobrescrita uma vez no boot.
 *
 * Nao persistida: e leitura publica e barata, e guardar em localStorage
 * criaria uma versao velha para conviver com a nova.
 */
export const remoteConfigAtom = atom<RemoteConfig>(DEFAULT_CONFIG)

/**
 * Estado da busca. Existe por dois motivos, nessa ordem de importancia:
 *
 * 1. **Deduplicacao.** `useConfig` pode ser chamado de varios lugares; so o
 *    que passa `initialFetch` busca, e mesmo assim so o primeiro. Sem isto,
 *    dois chamadores — ou o StrictMode, que monta o efeito duas vezes —
 *    fariam duas leituras.
 * 2. Deixar a UI distinguir "ainda e o padrao do codigo" de "veio do banco".
 */
export const configStatusAtom = atom<ConfigStatus>("default")
