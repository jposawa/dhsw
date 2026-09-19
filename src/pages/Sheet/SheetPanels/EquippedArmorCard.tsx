import { FeatureText } from "@/fragments"
import { describeModifierSource, formatSigned } from "@/helpers"
import type { DerivedStats } from "@/types"

import styles from "./ActiveWeapon.module.css"

type EquippedArmorCardProps = {
  derived: DerivedStats
}

/**
 * A armadura vestida, na lista de equipamento, ao lado das armas.
 *
 * É aqui que o Armor Score aparece como número — os slots para marcar ficam na
 * defesa, junto da Evasion, e repetir o número lá era dizer a mesma coisa
 * duas vezes. Sem armadura, o card diz de onde vem o zero (ou a Bare Bones).
 *
 * O que soma no Armor Score aparece em uma linha embaixo, com a origem de
 * cada ponto: é o detalhamento que o bloco de ARMOR mostrava ao toque.
 */
export const EquippedArmorCard = ({ derived }: EquippedArmorCardProps) => {
  const armor = derived.equippedArmor
  const { armorScore } = derived

  const breakdown = armorScore.modifiers
    .map((modifier) => `${describeModifierSource(modifier)} ${formatSigned(modifier.value)}`)
    .join(" · ")

  return (
    <li className={styles.weapon}>
      <span className={styles.slot}>ARMADURA</span>

      <header className={styles.head}>
        <hgroup className={styles.identity}>
          <h4 className={styles.name}>{armor ? armor.name : "Sem armadura"}</h4>
          <p className={styles.meta}>
            {!!armor && `${armor.line} · Tier ${armor.tier}`}
            {!armor && derived.hasBareBones && "Bare Bones no Loadout"}
            {!armor && !derived.hasBareBones && "Nenhuma vestida — escolha no Inventário"}
          </p>
        </hgroup>
        <b className={styles.damage} aria-label={`Armor Score ${armorScore.total}`}>
          {armorScore.total}
          <span className={styles.unit}> score</span>
        </b>
      </header>

      {!!breakdown && (
        <p className={styles.meta}>
          base {armorScore.base} · {breakdown}
        </p>
      )}

      {armor?.features.map((feature) => (
        <FeatureText key={feature} name={feature} />
      ))}
    </li>
  )
}
