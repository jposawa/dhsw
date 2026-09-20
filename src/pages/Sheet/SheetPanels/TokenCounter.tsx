import { Button, Stepper } from "@jposawa/ronin-ui"
import React from "react"

import { DieShape } from "@/components"
import { MarkerTrack } from "@/fragments"
import { domainColorToken } from "@/helpers"
import type { ActiveTokenPool, TokenRefill } from "@/types"

import styles from "./TokenCounter.module.css"

const REFILL_HINT: Readonly<Record<TokenRefill, string>> = {
  rest: "Voltam em qualquer descanso.",
  longRest: "Voltam no descanso longo.",
  manual: "Voltam quando a carta diz — ajuste à mão.",
}

const ACCUMULATOR_HINT: Readonly<Record<TokenRefill, string>> = {
  rest: "Zeram em qualquer descanso.",
  longRest: "Zeram no descanso longo.",
  manual: "Não zeram sozinhos.",
}

const DICE_HINT: Readonly<Record<TokenRefill, string>> = {
  rest: "Rolam de novo em qualquer descanso.",
  longRest: "Rolam de novo no descanso longo.",
  manual: "Role quando a feature mandar.",
}

type TokenCounterProps = {
  active: ActiveTokenPool
  count: number
  onChange: (next: number) => void
  /** Os dados guardados, quando a fonte é um punhado deles. */
  dice?: readonly number[]
  /** Rola a mão inteira, jogando fora o que não foi gasto. */
  onRoll?: () => void
  /** Gasta o dado desta posição. */
  onSpend?: (index: number) => void
  /** Guarda um dado com o valor que caiu na mesa. */
  onAdd?: (value: number) => void
}

/**
 * Os tokens de uma feature ou carta, desta ficha.
 *
 * Três formas, porque são três coisas diferentes:
 *
 * - **marca com teto** — pips como os de HP: aceso é token disponível;
 * - **acumulador** — sem teto para desenhar, então é um contador;
 * - **dado guardado** — o `Determination Dice`, em que cada token é um d4 já
 *   rolado e **o valor dele é a regra**: 3 de dano reduzido, +3 numa rolagem,
 *   3 de Hope. Uma contagem diria quantos sobraram e perderia quanto cada um
 *   vale, que é a única coisa que se lê na hora de gastar.
 *
 * O dado se gasta no toque — é jogada, grava na hora. Com a mão cheia não há o
 * que rolar nem o que guardar, e os dois controles somem: o `+` some de vez, e
 * o ROLAR fica apagado, porque rolar de novo jogaria fora dados bons.
 */
export const TokenCounter = ({
  active,
  count,
  onChange,
  dice = [],
  onRoll,
  onSpend,
  onAdd,
}: TokenCounterProps) => {
  // Carta Holocron tem um contador por habilidade: o nome diz qual é qual.
  const label = active.name === active.owner ? "TOKENS" : `TOKENS · ${active.name.toUpperCase()}`
  const color = active.domain ? domainColorToken(active.domain) : "var(--color-chrome)"

  const [typed, setTyped] = React.useState("")
  /** O campo de guardar só existe depois do `+`: fechado, a faixa fica limpa. */
  const [isAdding, setIsAdding] = React.useState(false)

  const handleAdd = () => {
    onAdd?.(Number(typed))
    setTyped("")
    setIsAdding(false)
  }

  const { dieSides } = active

  if (dieSides !== null) {
    const diceLabel = active.name === active.owner ? "DADOS" : `DADOS · ${active.name.toUpperCase()}`
    // Mão cheia: não há o que rolar de novo nem o que guardar.
    const isFull = active.max !== null && dice.length >= active.max

    return (
      <section className={styles.counter} aria-label={`Dados de ${active.owner}: ${active.name}`}>
        <p className={styles.diceHead}>
          <span className={styles.label}>
            {diceLabel} {dice.length}/{active.max ?? dice.length}
          </span>

          <span className={styles.diceActions}>
            {!isFull && (
              <Button
                className={styles.roll}
                variant="outline"
                aria-label={`Guardar um d${dieSides} rolado na mesa`}
                onClick={() => setIsAdding((open) => !open)}
              >
                +
              </Button>
            )}

            <Button
              className={styles.roll}
              variant="outline"
              disabled={isFull}
              onClick={() => onRoll?.()}
            >
              ROLAR
            </Button>
          </span>
        </p>

        {dice.length === 0 ? (
          <p className={styles.hint}>Nenhum dado guardado.</p>
        ) : (
          <ul className={styles.diceList}>
            {dice.map((value, index) => (
              <li key={`${index}-${value}`}>
                {/* Tocar gasta: é o gesto da mesa, e o valor some junto com o
                    dado porque é ele que foi usado. */}
                <button
                  type="button"
                  className={styles.die}
                  aria-label={`Gastar o dado de ${value}`}
                  onClick={() => onSpend?.(index)}
                >
                  {/* A cor é do domínio, como o resto da carta: `DieShape`
                      desenha com `currentColor`. */}
                  <DieShape sides={dieSides} style={{ color }}>
                    {value}
                  </DieShape>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* O número que caiu na mesa, quando a mesa rola dado de verdade. */}
        {isAdding && !isFull && (
          <form
            className={styles.addRow}
            onSubmit={(event) => {
              event.preventDefault()
              handleAdd()
            }}
          >
            <input
              className={styles.addInput}
              type="text"
              inputMode="numeric"
              autoFocus
              value={typed}
              placeholder={`d${dieSides} rolado na mesa`}
              aria-label={`Guardar um d${dieSides} rolado na mesa`}
              onChange={(event) => setTyped(event.target.value.replace(/[^0-9]/g, "").slice(0, 2))}
            />
            <Button type="submit" variant="outline" disabled={typed === ""}>
              GUARDAR
            </Button>
          </form>
        )}

        <p className={styles.hint}>{DICE_HINT[active.pool.refill]}</p>
      </section>
    )
  }

  return (
    <section className={styles.counter} aria-label={`Tokens de ${active.owner}: ${active.name}`}>
      {active.max === null ? (
        <p className={styles.accumulator}>
          <span className={styles.label}>{label}</span>
          <Stepper
            label={`tokens de ${active.name}`}
            decreaseLabel={`Tirar token de ${active.name}`}
            increaseLabel={`Pôr token em ${active.name}`}
            value={String(count)}
            canDecrease={count > 0}
            onDecrease={() => onChange(count - 1)}
            onIncrease={() => onChange(count + 1)}
          />
        </p>
      ) : (
        <MarkerTrack
          label={label}
          hasCount
          marked={count}
          max={active.max}
          color={color}
          emptyText="Nenhum token nesta escala."
          onChange={onChange}
        />
      )}

      <p className={styles.hint}>
        {active.max === null
          ? ACCUMULATOR_HINT[active.pool.refill]
          : REFILL_HINT[active.pool.refill]}
      </p>
    </section>
  )
}
