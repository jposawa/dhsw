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
 * **Fica colado no HP, e é a razão de existir.** O número sozinho — "Major 9" —
 * não responde a pergunta da mesa, que é "levei 11, marco quanto?". A régua
 * responde: abaixo de 9 marca 1, de 9 a 18 marca 2, de 19 para cima marca 3.
 *
 * Os dois limiares vêm de `derive`: saem da armadura vestida mais o nível, e
 * mudam quando qualquer um dos dois muda.
 */
export const ThresholdBar = ({ major, severe, className, style }: ThresholdBarProps) => (
  <dl className={clsx(styles.bar, className)} style={style}>
    <div className={styles.step}>
      <dt>MINOR</dt>
      <dd>1 HP</dd>
    </div>

    <b className={styles.value}>{major.total}</b>

    <div className={styles.step}>
      <dt>MAJOR</dt>
      <dd>2 HP</dd>
    </div>

    <b className={styles.value}>{severe.total}</b>

    <div className={styles.step}>
      <dt>SEVERE</dt>
      <dd>3 HP</dd>
    </div>
  </dl>
)
