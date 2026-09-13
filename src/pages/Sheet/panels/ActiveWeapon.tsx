import { FeatureText } from "@/fragments"
import { formatWeaponDamage } from "@/helpers"
import type { InventoryEntry, Weapon } from "@/types"

import styles from "./ActiveWeapon.module.css"

type ActiveWeaponProps = {
  slotLabel: string
  entry: InventoryEntry | undefined
  weapon: Weapon | undefined
  proficiency: number
  tierIndex: number
  /** Motivo de o slot estar vazio quando não é só "nada empunhado". */
  emptyText: string
}

/**
 * Uma arma empunhada, como se consulta no meio de um ataque: nome, atributo e
 * alcance, os dados de dano já com a Proficiency, e a feature — que é regra
 * que vale a cada ataque e por isso não pode ficar escondida no inventário.
 */
export const ActiveWeapon = ({
  slotLabel,
  entry,
  weapon,
  proficiency,
  tierIndex,
  emptyText,
}: ActiveWeaponProps) => (
  <li className={styles.weapon}>
    <span className={styles.slot}>{slotLabel}</span>

    {entry && weapon ? (
      <>
        <div className={styles.head}>
          <div className={styles.identity}>
            <h4 className={styles.name}>{entry.nickname ?? weapon.name}</h4>
            <p className={styles.meta}>
              {weapon.trait} · {weapon.range} · {weapon.burden}
            </p>
          </div>
          <b className={styles.damage}>{formatWeaponDamage(weapon, proficiency, tierIndex)}</b>
        </div>

        {weapon.feature ? <FeatureText name={weapon.feature} /> : null}
      </>
    ) : (
      <p className={styles.empty}>{emptyText}</p>
    )}
  </li>
)
