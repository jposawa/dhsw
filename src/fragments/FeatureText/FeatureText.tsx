import clsx from "clsx"

import { findEquipmentFeature } from "@/helpers"
import { useCompendium } from "@/hooks"
import type { BaseComponent } from "@/types"

import { RuleText } from "../RuleText"

import styles from "./FeatureText.module.css"

type FeatureTextProps = BaseComponent & {
  /** Nome no registro de features do compêndio. */
  name: string
}

/**
 * Uma feature de equipamento como o livro escreve: **Nome:** efeito.
 *
 * Lê o texto do registro, e não de quem cita a feature — é o que faz `Heavy`
 * dizer a mesma coisa numa armadura e numa arma. Nome fora do registro aparece
 * sozinho, sem inventar efeito.
 */
export const FeatureText = ({ name, className, style }: FeatureTextProps) => {
  const { compendium } = useCompendium()
  const feature = findEquipmentFeature(compendium, name)

  return (
    <RuleText
      className={clsx(styles.feature, className)}
      style={style}
      text={feature ? `**${feature.name}:** ${feature.text}` : `**${name}**`}
    />
  )
}
