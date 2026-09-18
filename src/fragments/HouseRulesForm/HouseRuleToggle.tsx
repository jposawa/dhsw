import { Switch } from "@/components"

import styles from "./HouseRuleToggle.module.css"

type HouseRuleToggleProps = {
  isOn: boolean
  title: string
  description: string
  isDisabled?: boolean
  onToggle: () => void
}

/** Uma regra da casa que liga e desliga, com o efeito dela escrito embaixo do nome. */
export const HouseRuleToggle = ({
  isOn,
  title,
  description,
  isDisabled = false,
  onToggle,
}: HouseRuleToggleProps) => (
  <Switch className={styles.block} isOn={isOn} disabled={isDisabled} onToggle={onToggle}>
    <span className={styles.text}>
      <span className={styles.title}>{title}</span>
      <span className={styles.note}>{description}</span>
    </span>
  </Switch>
)
