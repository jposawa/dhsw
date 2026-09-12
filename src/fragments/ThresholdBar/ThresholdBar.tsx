import clsx from "clsx"

import type { BaseComponent, ResolvedStat } from "@/types"

import styles from "./ThresholdBar.module.css"

type ThresholdBarProps = BaseComponent & {
  major: ResolvedStat
  severe: ResolvedStat
}

/**
 * Quantos Hit Points marcar por um dano.
 *
 * **Cada degrau carrega a própria faixa.** A primeira versão punha os dois
 * números soltos entre as células, e ali eles não pertenciam a nenhuma das
 * duas: dava para ler "10" como o fim do minor ou como o começo do major. Com
 * a faixa dentro da célula — `até 9`, `10 a 19`, `20+` — não há o que
 * interpretar, e é a mesma frase que alguém diria na mesa.
 *
 * Fica colado no HP porque a pergunta real é "levei 11, marco quanto?". O
 * número solto não responde isso.
 */
export const ThresholdBar = ({ major, severe, className, style }: ThresholdBarProps) => (
  <dl className={clsx(styles.bar, className)} style={style}>
    <div className={styles.step}>
      <dt className={styles.name}>MINOR</dt>
      <dd className={styles.range}>até {major.total - 1}</dd>
      <dd className={styles.cost}>1 HP</dd>
    </div>

    <div className={styles.step}>
      <dt className={styles.name}>MAJOR</dt>
      <dd className={styles.range}>
        {major.total} a {severe.total - 1}
      </dd>
      <dd className={styles.cost}>2 HP</dd>
    </div>

    <div className={clsx(styles.step, styles.severe)}>
      <dt className={styles.name}>SEVERE</dt>
      <dd className={styles.range}>{severe.total} ou mais</dd>
      <dd className={styles.cost}>3 HP</dd>
    </div>
  </dl>
)
