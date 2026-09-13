import { Button, Chip, Drawer, SectionLabel } from "@jposawa/ronin-ui"
import React from "react"

import { DOWNTIME_MOVES_PER_REST } from "@/constants"
import { RuleText } from "@/fragments"
import { useCompendium } from "@/hooks"
import { movesForRest, takeRest } from "@/rules"
import type { Character, DerivedStats, DowntimeChoice, RestKind, Result } from "@/types"

import { RestChoice } from "./RestChoice"

import styles from "./RestDrawer.module.css"

/**
 * Os dois descansos. "Rest" e não "Short Rest" porque é assim que as cartas do
 * compêndio chamam o descanso curto — a ficha fala a língua das cartas.
 */
const REST_KINDS: readonly { id: RestKind; label: string }[] = [
  { id: "short", label: "Rest" },
  { id: "long", label: "Long Rest" },
]

type RestDrawerProps = {
  isOpen: boolean
  character: Character
  derived: DerivedStats
  onApply: (result: Result<Character>) => void
  onClose: () => void
}

/**
 * Descansar: escolher o descanso, escolher duas ações, confirmar.
 *
 * É jogada de mesa e grava ao confirmar, sem passar pelo modo edição. A regra
 * decide se as duas escolhas valem — a gaveta só junta o que ela precisa.
 */
export const RestDrawer = ({ isOpen, character, derived, onApply, onClose }: RestDrawerProps) => {
  const { compendium } = useCompendium()
  const [rest, setRest] = React.useState<RestKind>("short")
  const [choices, setChoices] = React.useState<readonly DowntimeChoice[]>([])

  const moves = movesForRest(compendium, rest)
  const isFull = choices.length >= DOWNTIME_MOVES_PER_REST

  const handleRestChange = (next: RestKind) => {
    setRest(next)
    setChoices([])
  }

  const handleClose = () => {
    setChoices([])
    onClose()
  }

  const handleConfirm = () => {
    const result = takeRest(character, derived, rest, choices, compendium)
    onApply(result)

    if (result.ok) {
      handleClose()
    }
  }

  const addChoice = (moveId: string) => {
    setChoices([...choices, { moveId, rolled: null, isOnAlly: false, isWithParty: false }])
  }

  const replaceChoice = (index: number, next: DowntimeChoice) => {
    setChoices(choices.map((current, position) => (position === index ? next : current)))
  }

  const removeChoice = (index: number) => {
    setChoices(choices.filter((_, position) => position !== index))
  }

  return (
    <Drawer
      isOpen={isOpen}
      title="Descansar"
      onClose={handleClose}
      footer={
        <div className={styles.footer}>
          <Button variant="outline" onClick={handleClose}>
            CANCELAR
          </Button>
          <Button disabled={!isFull} onClick={handleConfirm}>
            CONFIRMAR
          </Button>
        </div>
      }
    >
      <div className={styles.body}>
        <div className={styles.kinds}>
          {REST_KINDS.map((kind) => (
            <Chip
              key={kind.id}
              label={kind.label}
              isActive={rest === kind.id}
              onToggle={() => handleRestChange(kind.id)}
            />
          ))}
        </div>

        <p className={styles.note}>
          Troque cartas entre Loadout e vault antes, na aba Cartas. Depois escolha duas ações; a
          mesma pode ir duas vezes.
        </p>

        <section className={styles.section}>
          <SectionLabel detail={`${choices.length}/${DOWNTIME_MOVES_PER_REST}`}>
            <h3>ESCOLHIDAS</h3>
          </SectionLabel>

          {choices.length === 0 ? (
            <p className={styles.note}>Nenhuma ainda.</p>
          ) : (
            <ul className={styles.list}>
              {choices.map((choice, index) => {
                const move = moves.find((candidate) => candidate.id === choice.moveId)

                return move ? (
                  <RestChoice
                    key={`${choice.moveId}-${index}`}
                    move={move}
                    choice={choice}
                    tier={derived.tier}
                    onChange={(next) => replaceChoice(index, next)}
                    onRemove={() => removeChoice(index)}
                  />
                ) : null
              })}
            </ul>
          )}
        </section>

        <section className={styles.section}>
          <SectionLabel>
            <h3>AÇÕES</h3>
          </SectionLabel>

          <ul className={styles.list}>
            {moves.map((move) => (
              <li className={styles.move} key={move.id}>
                <div className={styles.moveText}>
                  <h4 className={styles.moveName}>{move.name}</h4>
                  <RuleText className={styles.moveBody} text={move.text} />
                </div>
                <Button
                  variant="outline"
                  disabled={isFull}
                  aria-label={`Escolher ${move.name}`}
                  onClick={() => addChoice(move.id)}
                >
                  ESCOLHER
                </Button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Drawer>
  )
}
