
import { Button } from "@jposawa/ronin-ui"

import { FeatureText, RuleText } from "@/fragments"
import { augmentRollBonuses, augmentsOf, formatSigned, formatWeaponDamage, presetsForWeapon } from "@/helpers"
import { useCompendium, useHouseRules } from "@/hooks"
import type { DerivedStats, DicePreset, InventoryEntry, Weapon } from "@/types"

import styles from "./ActiveWeapon.module.css"

type ActiveWeaponProps = {
  slotLabel: string
  entry: InventoryEntry | undefined
  weapon: Weapon | undefined
  proficiency: number
  tierIndex: number
  /** Motivo de o slot estar vazio quando não é só "nada empunhado". */
  emptyText: string
  derived: DerivedStats
  /** Prepara o rolador com o ataque ou o dano — não rola. */
  onPrepareRoll: (preset: DicePreset) => void
}

/**
 * Uma arma empunhada, como se consulta no meio de um ataque: nome, atributo e
 * alcance, os dados de dano já com a Proficiency e os augments, e a feature —
 * que é regra que vale a cada ataque e por isso não pode ficar escondida no
 * inventário.
 */
export const ActiveWeapon = ({
  slotLabel,
  entry,
  weapon,
  proficiency,
  tierIndex,
  emptyText,
  derived,
  onPrepareRoll,
}: ActiveWeaponProps) => {
  const { compendium } = useCompendium()
  const houseRules = useHouseRules()

  if (!entry || !weapon) {
    return (
      <li className={styles.weapon}>
        <span className={styles.slot}>{slotLabel}</span>
        <p className={styles.empty}>{emptyText}</p>
      </li>
    )
  }

  const { damageBonus, attackBonus } = augmentRollBonuses(entry, houseRules, compendium)
  const augments = houseRules.hasCustomWeapons ? augmentsOf(entry, compendium) : []
  const presets = presetsForWeapon(weapon, entry.nickname ?? weapon.name, derived, {
    attackBonus,
    damageBonus,
  })

  return (
    <li className={styles.weapon}>
      <span className={styles.slot}>{slotLabel}</span>

      <header className={styles.head}>
        <hgroup className={styles.identity}>
          <h4 className={styles.name}>{entry.nickname ?? weapon.name}</h4>
          <p className={styles.meta}>
            {weapon.trait} · {weapon.range} · {weapon.burden}
            {attackBonus === 0 ? null : ` · ${formatSigned(attackBonus)} ataque`}
          </p>
        </hgroup>
        <b className={styles.damage}>
          {formatWeaponDamage(weapon, proficiency, tierIndex, {
            extraBonus: damageBonus,
            hasGranularDamageTypes: houseRules.hasGranularDamageTypes,
          })}
        </b>
      </header>

      {!!weapon.feature && <FeatureText name={weapon.feature} />}

      {augments.map((augment) => (
        <RuleText key={augment.name} text={`**${augment.name}:** ${augment.text}`} />
      ))}

      <p className={styles.actions}>
        <Button variant="outline" onClick={() => onPrepareRoll(presets.attack)}>
          ATACAR
        </Button>
        <Button variant="outline" onClick={() => onPrepareRoll(presets.damage)}>
          DANO
        </Button>
      </p>
    </li>
  )
}
