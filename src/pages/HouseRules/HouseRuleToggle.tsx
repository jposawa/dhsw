import { Pip } from "@/components"

import styles from "./HouseRuleToggle.module.css"

type HouseRuleToggleProps = {
  isOn: boolean
  title: string
  description: string
  onToggle: () => void
}

/** Uma regra da casa que liga e desliga, com o efeito dela em uma frase. */
export const HouseRuleToggle = ({ isOn, title, description, onToggle }: HouseRuleToggleProps) => (
  <article className={styles.block}>
    <Pip isMarked={isOn} label={title} onToggle={onToggle} />
    <div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.note}>{description}</p>
    </div>
  </article>
)
