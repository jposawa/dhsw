/**
 * Autenticacao. Tipos proprios — o `User` do Firebase e tipo de vendor e nao
 * sobe de `services/`, pela mesma regra que segura `firebase/database`.
 */

export type AuthUser = {
  userId: string
  displayName: string
  email: string
  photoUrl: string | null
}

/**
 * `unknown` nao e detalhe: no boot o Firebase leva um instante para restaurar
 * a sessao. Sem esse estado, quem ja esta logado ve a tela de login piscar.
 */
export type AuthStatus = 'unknown' | 'signed-in' | 'signed-out'

export type AuthState = {
  status: AuthStatus
  user: AuthUser | null
}

/** Estado da sincronizacao das fichas com o Realtime Database. */
export type SyncStatus = 'idle' | 'pulling' | 'ready' | 'error'
