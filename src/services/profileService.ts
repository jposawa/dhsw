import { get, update } from 'firebase/database'

import { DB_PATHS } from '@/constants'
import { dhswRef } from '@/lib/firebase'
import type { AuthUser, Profile } from '@/types'

/**
 * Espelho do usuário autenticado em `profiles/<uid>`.
 *
 * Existe para que uma lista de acesso mostre "Fulano" em vez de um uid. O
 * cliente só escreve o próprio nó — a regra de segurança exige
 * `auth.uid === $uid`.
 */

export const fetchProfile = async (userId: string): Promise<Profile | null> => {
  const snapshot = await get(dhswRef(DB_PATHS.profile(userId)))

  return snapshot.exists() ? (snapshot.val() as Profile) : null
}

/**
 * Chamado a cada login.
 *
 * `email` e `photoUrl` são espelho do provedor e são reescritos sempre — deixar
 * editáveis faria deles alegação, não espelho.
 *
 * **`displayName` só é escrito na criação.** Depois ele é do dono: `upsertProfile`
 * roda a cada entrada, e sobrescrever aqui desfaria em silêncio qualquer nome
 * que a pessoa tivesse ajustado na tela de perfil.
 */
export const upsertProfile = async (user: AuthUser): Promise<void> => {
  const existing = await fetchProfile(user.userId)

  await update(dhswRef(DB_PATHS.profile(user.userId)), {
    userId: user.userId,
    email: user.email,
    photoUrl: user.photoUrl,
    displayName: existing?.displayName ?? user.displayName,
  })
}

export const updateDisplayName = async (
  userId: string,
  displayName: string,
): Promise<void> => {
  await update(dhswRef(DB_PATHS.profile(userId)), { displayName })
}
