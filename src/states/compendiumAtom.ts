import { atom } from "jotai"

import { EMPTY_COMPENDIUM } from "@/compendium"
import type { Compendium, CompendiumCollection, ConfigStatus } from "@/types"

/**
 * O compêndio em uso. Começa vazio e é preenchido uma vez pelo banco — ver
 * `compendium/index.ts` sobre por que não há JSON embarcado nem cache.
 */
export const compendiumAtom = atom<Compendium>(EMPTY_COMPENDIUM)

/** Deduplica a busca, como `configStatusAtom`. */
export const compendiumStatusAtom = atom<ConfigStatus>("default")

/** Coleções que o banco não tem, ou tem num formato que não se lê. */
export const compendiumGapsAtom = atom<readonly CompendiumCollection[]>([])
