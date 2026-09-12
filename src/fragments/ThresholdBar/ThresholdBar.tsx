import clsx from "clsx"

import type { BaseComponent, ResolvedStat } from "@/types"

import styles from "./ThresholdBar.module.css"

type ThresholdBarProps = BaseComponent & {
  major: ResolvedStat
  severe: ResolvedStat
  /** De onde saíram os números, numa linha — "Trooper Plate 7/15 + nível 1". */
  origin: string
}

/**
 * Quantos Hit Points marcar por um dano — a régua da ficha do livro.
 *
 * Três faixas com o custo e, **entre elas**, o número que muda de faixa: dano
 * igual ou acima de 8 é Major. É a pergunta da mesa ("levei 11, marco
 * quanto?") respondida sem conta, e é como a ficha impressa desenha.
 *
 * Lista ordenada porque é uma sequência: a leitura por áudio sai "Minor,
 * marca 1 HP; Major a partir de 8…", na ordem em que o dano cresce.
 */
export const ThresholdBar = ({ major, severe, origin, className, style }: ThresholdBarProps) => (
  <figure className={clsx(styles.figure, className)} style={style}>
    <ol className={styles.bar}>
      <li className={styles.step}>
        <span className={styles.name}>MINOR</span>
        <span className={styles.cost}>1 HP</span>
      </li>

      <li className={styles.mark} aria-label={`Major a partir de ${major.total}`}>
        {major.total}
      </li>

      <li className={styles.step}>
        <span className={styles.name}>MAJOR</span>
        <span className={styles.cost}>2 HP</span>
      </li>

      <li className={styles.mark} aria-label={`Severe a partir de ${severe.total}`}>
        {severe.total}
      </li>

      <li className={clsx(styles.step, styles.severe)}>
        <span className={styles.name}>SEVERE</span>
        <span className={styles.cost}>3 HP</span>
      </li>
    </ol>

    <figcaption className={styles.origin}>{origin}</figcaption>
  </figure>
)
