import { FeatureText, RuleText } from "@/fragments"
import { describeNamedArmor } from "@/helpers"
import { useCompendium } from "@/hooks"
import type { GearKind } from "@/types"

import styles from "./GearSummary.module.css"

type GearSummaryProps = {
  kind: GearKind
  name: string
}

/**
 * O que um equipamento faz, numa entrada do catálogo: os números que decidem a
 * escolha e a feature, com o texto do registro.
 *
 * Armadura mostra Armor Score e thresholds base — é o que muda na ficha ao
 * vestir, e sem isso escolher armadura era escolher por nome.
 */
export const GearSummary = ({ kind, name }: GearSummaryProps) => {
  const { compendium } = useCompendium()

  if (kind === "armas") {
    const weapon = compendium.weapons.find((candidate) => candidate.name === name)

    if (!weapon) {
      return null
    }

    return (
      <>
        <p className={styles.meta}>
          {weapon.trait} · {weapon.range} · {weapon.damageDie} {weapon.damageType} · {weapon.burden}
        </p>
        {weapon.feature ? <FeatureText className={styles.body} name={weapon.feature} /> : null}
      </>
    )
  }

  if (kind === "armaduras") {
    const described = describeNamedArmor(compendium, name)

    if (!described) {
      return null
    }

    return (
      <>
        <p className={styles.meta}>
          Tier {described.armor.tier} · Armor Score {described.stats.baseScore} · Thresholds{" "}
          {described.stats.majorBase}/{described.stats.severeBase}
        </p>
        {described.features.map((feature) => (
          <FeatureText className={styles.body} key={feature} name={feature} />
        ))}
      </>
    )
  }

  const entry = (kind === "itens" ? compendium.items : compendium.consumables).find(
    (candidate) => candidate.name === name,
  )

  return entry ? <RuleText className={styles.body} text={entry.text} /> : null
}
