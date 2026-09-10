import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { STORAGE_KEYS } from '@/constants'
import type { Theme } from '@/types'

/** Escuro e o padrao: app de mesa, sala mal iluminada. */
export const themeAtom = atomWithStorage<Theme>(STORAGE_KEYS.theme, 'dark', undefined, {
  getOnInit: true,
})

/**
 * Trilho lateral recolhido, no desktop. Persistido: é preferência de layout, e
 * reabrir o app desfazendo a escolha seria o app discordando de quem o usa.
 *
 * Sem efeito abaixo de 900px, onde a navegação é a barra inferior e não há o
 * que recolher — o botão nem aparece.
 */
export const isNavCollapsedAtom = atomWithStorage<boolean>(
  STORAGE_KEYS.navCollapsed,
  false,
  undefined,
  { getOnInit: true },
)

/** Troca livre de loadout durante descanso. Estado de sessao, nao persistido. */export const isFreeSwapAtom = atom(false)

/** Cartas abertas no compendio. Estado de sessao. */
export const openSkillsAtom = atom<ReadonlySet<string>>(new Set<string>())

export const toastAtom = atom<string | null>(null)
