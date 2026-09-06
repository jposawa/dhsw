import { atom } from 'jotai'

import type { AuthState, SheetRoleId, SyncStatus } from '@/types'

/**
 * Estado de autenticacao. Nao persistido: quem guarda a sessao e o proprio
 * Firebase, e duplicar isso em localStorage criaria duas versoes da verdade.
 *
 * Comeca em `unknown` de proposito — ver `types/auth.ts`.
 */
export const authAtom = atom<AuthState>({ status: 'unknown', user: null })

export const syncStatusAtom = atom<SyncStatus>('idle')

/** Papel do usuario em cada ficha que ele alcanca. Vem de `userSheets`. */
export const sheetRolesAtom = atom<Readonly<Record<string, SheetRoleId>>>({})
