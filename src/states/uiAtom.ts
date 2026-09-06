import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { STORAGE_KEYS } from '@/constants'
import type { Theme } from '@/types'

/** Escuro e o padrao: app de mesa, sala mal iluminada. */
export const themeAtom = atomWithStorage<Theme>(STORAGE_KEYS.theme, 'dark', undefined, {
  getOnInit: true,
})

/** Troca livre de loadout durante descanso. Estado de sessao, nao persistido. */
export const isFreeSwapAtom = atom(false)

/** Cartas abertas no compendio. Estado de sessao. */
export const openSkillsAtom = atom<ReadonlySet<string>>(new Set<string>())

export const toastAtom = atom<string | null>(null)
