import { atom } from "jotai"

import type { AuthState, SheetRoleId, SyncStatus } from "@/types"

/**
 * Estado de autenticacao. Nao persistido: quem guarda a sessao e o proprio
 * Firebase, e duplicar isso em localStorage criaria duas versoes da verdade.
 *
 * Comeca em `unknown` de proposito — ver `types/auth.ts`.
 */
export const authAtom = atom<AuthState>({ status: "unknown", user: null })

export const syncStatusAtom = atom<SyncStatus>("idle")

/**
 * Motivo da ultima falha de sincronizacao, cru.
 *
 * Existe porque "sem sincronizar" nao diz nada para quem esta testando: a
 * diferenca entre regra de seguranca recusando e rede caida muda o que voce
 * vai consertar. Aparece no Perfil, nao em toast — e diagnostico, nao recado.
 */
export const syncErrorAtom = atom<string | null>(null)

/** Papel do usuario em cada ficha que ele alcanca. Vem de `userSheets`. */
export const sheetRolesAtom = atom<Readonly<Record<string, SheetRoleId>>>({})

/**
 * Fichas com mudança local que o servidor ainda não recebeu.
 *
 * Existe para a ficha poder dizer se já salvou. O app grava no dedo e empurra
 * com atraso — não há botão de salvar, e sem este conjunto não há como
 * distinguir "salvo" de "ainda não", que é a dúvida que faz alguém fechar o
 * app com medo de perder a sessão.
 *
 * Quem mantém é `useSheetSync`; a UI só lê.
 */
export const unsyncedSheetIdsAtom = atom<ReadonlySet<string>>(new Set<string>())
