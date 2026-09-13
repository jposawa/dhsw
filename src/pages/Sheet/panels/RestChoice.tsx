import { Button, Chip, Stepper } from "@jposawa/ronin-ui"

import { parseDice } from "@/helpers"
import type { DowntimeChoice, DowntimeMove } from "@/types"

import styles from "./RestChoice.module.css"

type RestChoiceProps = {
  move: DowntimeMove
  choice: DowntimeChoice
  tier: number
  onChange: (choice: DowntimeChoice) => void
  onRemove: () => void
}

/**
 * Uma ação escolhida, com o que ela ainda precisa saber: o dado rolado, se foi
 * feita num aliado, se o Prepare foi com o grupo.
 *
 * O dado pode ser rolado aqui ou digitado — muita mesa rola dado físico, e o
 * app não pode obrigar a trocar o dado da mão pelo da tela.
 */
export const RestChoice = ({ move, choice, tier, onChange, onRemove }: RestChoiceProps) => {
  const { effect } = move

  const renderDice = () => {
    if (effect.kind !== "clearRolled") {
      return null
    }

    const { count, sides } = parseDice(effect.dice)
    const rolled = choice.rolled

    const handleRoll = () => {
      let total = 0

      for (let die = 0; die < count; die += 1) {
        total += Math.floor(Math.random() * sides) + 1
      }

      onChange({ ...choice, rolled: total })
    }

    return (
      <div className={styles.dice}>
        <Stepper
          label={`resultado de ${effect.dice}`}
          decreaseLabel="Diminuir resultado"
          increaseLabel="Aumentar resultado"
          value={rolled === null ? "—" : String(rolled)}
          canDecrease={rolled !== null && rolled > count}
          canIncrease={rolled === null || rolled < count * sides}
          onDecrease={() => onChange({ ...choice, rolled: (rolled ?? count) - 1 })}
          onIncrease={() => onChange({ ...choice, rolled: rolled === null ? count : rolled + 1 })}
        />
        <Button variant="outline" onClick={handleRoll}>
          ROLAR {effect.dice.toUpperCase()}
        </Button>
        <span className={styles.total}>
          {rolled === null ? `${effect.dice} + Tier ${tier}` : `limpa ${rolled + tier}`}
        </span>
      </div>
    )
  }

  const canTargetAlly =
    (effect.kind === "clearRolled" || effect.kind === "clearAll") && effect.canTargetAlly

  return (
    <li className={styles.choice}>
      <div className={styles.head}>
        <h4 className={styles.name}>{move.name}</h4>
        <Button variant="text" intent="danger" aria-label={`Tirar ${move.name}`} onClick={onRemove}>
          TIRAR
        </Button>
      </div>

      {renderDice()}

      {canTargetAlly ? (
        <Chip
          label="Num aliado"
          isActive={choice.isOnAlly}
          onToggle={() => onChange({ ...choice, isOnAlly: !choice.isOnAlly })}
        />
      ) : null}

      {effect.kind === "gainHope" ? (
        <Chip
          label={`Com o grupo (+${effect.withPartyAmount})`}
          isActive={choice.isWithParty}
          onToggle={() => onChange({ ...choice, isWithParty: !choice.isWithParty })}
        />
      ) : null}
    </li>
  )
}
