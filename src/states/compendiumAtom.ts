import { atom } from "jotai"

import { FALLBACK_COMPENDIUM } from "@/compendium"
import type { Compendium, ConfigStatus } from "@/types"

/**
 * O compêndio em uso. Começa no JSON embarcado — válido desde o primeiro
 * render e offline — e é trocado uma vez pelo que vier do banco.
 */
export const compendiumAtom = atom<Compendium>(FALLBACK_COMPENDIUM)

/** Deduplica a busca, como `configStatusAtom`. */
export const compendiumStatusAtom = atom<ConfigStatus>("default")
