import { useAtomValue } from 'jotai'
import { Link, Outlet } from 'react-router-dom'

import { StepRule } from '@/components'
import { ROUTES } from '@/constants'
import { useAuth } from '@/hooks'
import { authAtom } from '@/states'

import styles from './AuthGate.module.css'

/**
 * Porta da parte de ficha.
 *
 * Renderiza a entrada no lugar em vez de redirecionar: assim o link de uma
 * ficha sobrevive ao login — a pessoa entra e cai onde queria, em vez de cair
 * no roster e ter que procurar de novo.
 *
 * O compêndio não passa por aqui. Ele é módulo TS estático: não toca o
 * Firebase, funciona offline, e é público por construção.
 */
export const AuthGate = () => {
  const { status } = useAtomValue(authAtom)
  const { signIn } = useAuth()

  if (status === 'unknown') {
    return (
      <main className={styles.page}>
        <p className={styles.waiting}>Restaurando sessão…</p>
      </main>
    )
  }

  if (status === 'signed-out') {
    return (
      <main className={styles.page}>
        <StepRule />
        <div className={styles.panel}>
          <h2 className={styles.title}>Entrar para ver suas fichas</h2>
          <p className={styles.body}>
            A ficha é sua e fica na sua conta — é o que permite abrir o mesmo
            personagem no celular e no computador, e compartilhar com a mesa depois.
          </p>
          <button type="button" className={styles.signIn} onClick={() => void signIn()}>
            ENTRAR COM GOOGLE
          </button>
          <p className={styles.note}>
            O compêndio não exige conta: as 126 cartas, classes, espécies e
            equipamento estão abertos e funcionam sem internet.
          </p>
          <Link className={styles.link} to={ROUTES.compendium}>
            ‹ &nbsp;IR PARA O COMPÊNDIO
          </Link>
        </div>
      </main>
    )
  }

  return <Outlet />
}
