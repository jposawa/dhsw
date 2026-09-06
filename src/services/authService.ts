import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'

import { firebaseAuth } from '@/lib/firebase'
import type { AuthUser } from '@/types'

/**
 * Login com Google.
 *
 * Só a ficha exige conta. O compêndio é público e não passa por aqui — ele é
 * módulo TS estático, não sai do bundle e não toca o Firebase. Ver BACKEND.md.
 *
 * `firebase/auth` só é importado aqui e em `lib/firebase.ts`, mesma regra de
 * vendor que vale para `firebase/database`.
 */

const provider = new GoogleAuthProvider()

/** Vendor não sobe: o `User` do Firebase vira tipo do domínio na fronteira. */
const toAuthUser = (user: User): AuthUser => ({
  userId: user.uid,
  displayName: user.displayName ?? user.email ?? 'Sem nome',
  email: user.email ?? '',
  photoUrl: user.photoURL,
})

/**
 * Popup, não redirect.
 *
 * O redirect depende de estado guardado no domínio do handler de auth
 * (`*.firebaseapp.com`), que é outro domínio quando o app está hospedado em
 * Pages. Navegador que bloqueia storage de terceiros — Safari por padrão —
 * perde esse estado e o login volta sem sessão, sem erro visível.
 *
 * O custo do popup é bloqueador de pop-up: por isso a chamada tem que sair de
 * um clique direto, nunca de um efeito.
 */
export const signInWithGoogle = async (): Promise<AuthUser> => {
  const credential = await signInWithPopup(firebaseAuth, provider)

  return toAuthUser(credential.user)
}

export const signOutUser = async (): Promise<void> => {
  await signOut(firebaseAuth)
}

/**
 * Assina o estado de autenticação. Devolve a função de cancelamento.
 *
 * Dispara também na restauração da sessão no boot — é o que tira o app do
 * estado `unknown`.
 */
export const subscribeToAuth = (
  onChange: (user: AuthUser | null) => void,
): (() => void) =>
  onAuthStateChanged(firebaseAuth, (user) => {
    onChange(user ? toAuthUser(user) : null)
  })
