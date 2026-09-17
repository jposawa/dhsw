import { HouseRulesForm } from "@/fragments"
import type { Character, HouseRules } from "@/types"

import styles from "./RulesPanel.module.css"

type RulesPanelProps = {
  character: Character
  /** As regras da mesa, ao vivo. `null` sem mesa ou sem acesso a ela. */
  partyRules: HouseRules | null
  isEditing: boolean
  onChange: (mutate: (current: Character) => Character) => void
}

/**
 * As regras da casa que a ficha usa.
 *
 * Em mesa, mandam as da mesa, e aqui elas só aparecem: quem ajusta é o
 * Narrador, na página do grupo. Fora de mesa, a ficha tem as dela, e mudá-las
 * é progressão — só em Editar ficha, com Salvar.
 */
export const RulesPanel = ({ character, partyRules, isEditing, onChange }: RulesPanelProps) => {
  if (character.partyId) {
    return (
      <section className={styles.layout} aria-label="Regras da casa">
        <p className={styles.note}>
          {partyRules
            ? "Esta ficha está numa mesa: valem as regras que o Narrador definiu para ela."
            : "Esta ficha está numa mesa, mas as regras dela não carregaram. Enquanto isso, valem as da própria ficha."}
        </p>
        <HouseRulesForm value={partyRules ?? character.houseRules} />
      </section>
    )
  }

  return (
    <section className={styles.layout} aria-label="Regras da casa">
      <p className={styles.note}>
        {isEditing
          ? "As regras desta ficha. Mudam só ela, e só depois de Salvar."
          : "As regras desta ficha. Para mudar, entre em Editar ficha."}
      </p>
      <HouseRulesForm
        value={character.houseRules}
        onChange={
          isEditing
            ? (houseRules) => onChange((current) => ({ ...current, houseRules }))
            : undefined
        }
      />
    </section>
  )
}
