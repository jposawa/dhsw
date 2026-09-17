import type React from "react"

import { RuleText } from "@/fragments"
import type { Subclass, SubclassFeature } from "@/types"

import styles from "./Identity.module.css"

type SubclassTiersProps = {
  subclass: Subclass
  /**
   * Quantas "subclasse melhorada" a ficha comprou. Ausente na escolha, onde as
   * três cartas são só prévia e nenhuma está obtida ou trancada.
   */
  upgrades?: number
  /** Contador de tokens de uma feature ganha, na ficha em mesa. */
  renderTokens?: (featureName: string) => React.ReactNode
}

type TierRow = {
  id: "foundation" | "specialization" | "mastery"
  label: string
  /** Quando se ganha. Core Rulebook, "Leveling Up" (p. 110). */
  when: string
  requiredUpgrades: number
}

const TIERS: readonly TierRow[] = [
  {
    id: "foundation",
    label: "FOUNDATION",
    when: "ao escolher",
    requiredUpgrades: 0,
  },
  {
    id: "specialization",
    label: "SPECIALIZATION",
    when: "subclasse melhorada, a partir do Tier 3",
    requiredUpgrades: 1,
  },
  {
    id: "mastery",
    label: "MASTERY",
    when: "segunda subclasse melhorada",
    requiredUpgrades: 2,
  },
]

const featureMarkdown = (feature: SubclassFeature) => `**${feature.name}** — ${feature.text}`

/** As três cartas da subclasse, na ordem em que se ganham. */
export const SubclassTiers = ({ subclass, upgrades, renderTokens }: SubclassTiersProps) => (
  <ol className={styles.tiers}>
    {TIERS.map((tier) => {
      const isLocked = upgrades !== undefined && upgrades < tier.requiredUpgrades

      return (
        <li key={tier.id} className={styles.tier} data-locked={isLocked || undefined}>
          <h5 className={styles.tierLabel}>
            {tier.label}
            <span className={styles.tierWhen}>{isLocked ? "ainda não" : tier.when}</span>
          </h5>

          <ul className={styles.featureList}>
            {subclass[tier.id].map((feature) => (
              <li key={feature.name}>
                <RuleText className={styles.featureText} text={featureMarkdown(feature)} />
                {isLocked ? null : renderTokens?.(feature.name)}
              </li>
            ))}
          </ul>
        </li>
      )
    })}
  </ol>
)
