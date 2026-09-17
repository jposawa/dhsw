import { useCompendium } from "@/hooks"

import styles from "./CompendiumNotice.module.css"

/**
 * Faixa sob o brasão quando o compêndio não está inteiro.
 *
 * O compêndio vem só do banco, sem JSON de reserva. Sem esta faixa, falha de
 * rede ou coleção faltando apareceriam como listas vazias e fichas "sem
 * classe" — a mesa leria isso como o jogo, e não como um problema.
 *
 * Com o compêndio inteiro, não renderiza nada.
 */
export const CompendiumNotice = () => {
  const { status, gaps } = useCompendium()

  if (status === "loading" || status === "default") {
    return (
      <p className={styles.notice} role="status">
        Carregando o compêndio…
      </p>
    )
  }

  if (status === "error") {
    return (
      <p className={styles.notice} data-tone="danger" role="alert">
        O compêndio não carregou. Confira a conexão e recarregue a página.
      </p>
    )
  }

  if (gaps.length > 0) {
    return (
      <p className={styles.notice} data-tone="danger" role="alert">
        Compêndio incompleto: faltam {gaps.join(", ")}.
      </p>
    )
  }

  return null
}
