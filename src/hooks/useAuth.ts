import { useAtom, useSetAtom } from 'jotai'
import React from 'react'

import { signInWithGoogle, signOutUser, subscribeToAuth, upsertProfile } from '@/services'
import { authAtom, sheetRolesAtom, syncStatusAtom, toastAtom } from '@/states'
import type { AuthState } from '@/types'

type UseAuthResult = AuthState & {
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

/**
 * Assina o estado de autenticação e expõe as duas ações.
 *
 * Chamado uma vez, no `App`. Os outros lugares leem `authAtom` direto — dois
 * assinantes do Firebase seria trabalho repetido, não redundância útil.
 */
export const useAuth = (): UseAuthResult => {
  const [auth, setAuth] = useAtom(authAtom)
  const setSyncStatus = useSetAtom(syncStatusAtom)
  const setSheetRoles = useSetAtom(sheetRolesAtom)
  const setToast = useSetAtom(toastAtom)

  React.useEffect(
    () =>
      subscribeToAuth((user) => {
        setAuth({ status: user ? 'signed-in' : 'signed-out', user })

        if (user) {
          // O perfil é espelho, não requisito: falhar aqui não pode impedir
          // ninguém de abrir a própria ficha.
          void upsertProfile(user).catch(() => undefined)
        }
      }),
    [setAuth],
  )

  const signIn = async () => {
    try {
      await signInWithGoogle()
    } catch {
      // Popup fechado pela pessoa é o caso comum e não é erro a reportar;
      // bloqueado pelo navegador é, e os dois chegam como a mesma exceção.
      setToast('Não foi possível entrar. Verifique o bloqueador de pop-up.')
    }
  }

  const signOut = async () => {
    await signOutUser()
    setSyncStatus('idle')
    setSheetRoles({})
    // As fichas locais ficam. Apagar seria perder o trabalho de quem só
    // queria trocar de conta — e sem login o roster nem é alcançável.
  }

  return { ...auth, signIn, signOut }
}
