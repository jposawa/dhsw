import { SectionLabel } from "@jposawa/ronin-ui"
import React from "react"

import { Switch } from "@/components"
import { PARTY_ROLLS_SHOWN } from "@/constants"
import { DiceRoller, RollLog } from "@/fragments"
import { usePartyRolls } from "@/hooks"

import styles from "./PartyDetail.module.css"

type PartyRollsProps = {
  partyId: string
  isNarrator: boolean
}

/**
 * Rolagens da mesa, ao vivo para todos os membros.
 *
 * Jogador rola sempre à vista. O Narrador escolhe: com "Só para mim", a
 * rolagem vai para o nó que só Narrador lê, e aparece aqui marcada.
 */
export const PartyRolls = ({ partyId, isNarrator }: PartyRollsProps) => {
  const { rolls, roll } = usePartyRolls(partyId, isNarrator)
  const [isPrivate, setIsPrivate] = React.useState(false)

  return (
    <section className={styles.rollsPanel} aria-label="Rolagens da mesa">
      <DiceRoller
        onRoll={(result) =>
          roll(result, { visibility: isNarrator && isPrivate ? "gm" : "public" })
        }
      >
        {isNarrator && (
          <Switch isOn={isPrivate} onToggle={() => setIsPrivate(!isPrivate)}>
            SÓ PARA MIM
          </Switch>
        )}
      </DiceRoller>

      <div className={styles.column}>
        <SectionLabel detail={`últimas ${PARTY_ROLLS_SHOWN}`}>
          <h3>ROLAGENS DA MESA</h3>
        </SectionLabel>

        <RollLog rolls={rolls} showAuthor emptyText="Ninguém rolou nesta mesa ainda." />
      </div>
    </section>
  )
}
