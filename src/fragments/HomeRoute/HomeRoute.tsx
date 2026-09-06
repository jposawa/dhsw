import { Navigate } from 'react-router-dom'

import { useHomeRoute } from '@/hooks'

import styles from './HomeRoute.module.css'

/**
 * `/` não tem tela própria: manda para o destino da sessão.
 *
 * O destino vem da config remota, com fallback no código — `useHomeRoute`.
 * O padrão é fichas para quem entrou e compêndio para quem não entrou:
 * mandar quem não tem conta para uma porta fechada seria mostrar primeiro
 * o que ela não pode usar.
 *
 * `replace` para a raiz não ficar no histórico: voltar levaria de volta ao
 * redirecionamento, e daí para frente de novo.
 */
export const HomeRoute = () => {
  const { isResolving, path } = useHomeRoute()

  // Sessão ainda sendo restaurada. Decidir agora mandaria quem está logado
  // para o compêndio e trocaria a página embaixo do dedo um instante depois.
  if (isResolving) {
    return (
      <main className={styles.page}>
        <p className={styles.waiting}>Restaurando sessão…</p>
      </main>
    )
  }

  // Só acontece se o catálogo ficar sem nenhum destino servível — hoje
  // impossível, já que o compêndio é público. Uma tela em branco seria pior
  // que dizer o que houve.
  if (!path) {
    return (
      <main className={styles.page}>
        <p className={styles.waiting}>Nenhum destino disponível.</p>
      </main>
    )
  }

  return <Navigate to={path} replace />
}
