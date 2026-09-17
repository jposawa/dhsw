import { Button, Chip, Input, Stepper } from "@jposawa/ronin-ui"
import clsx from "clsx"
import React from "react"

import { DIE_SIDES } from "@/constants"
import { formatSigned } from "@/helpers"
import {
  addDieToPool,
  cryptoDie,
  type DicePool,
  EMPTY_POOL,
  formatDicePool,
  parseDicePool,
  rollPool,
} from "@/rules"
import type { BaseComponent, DicePreset, RollResult } from "@/types"

import styles from "./DiceRoller.module.css"

type DiceRollerProps = BaseComponent & {
  onRoll: (result: RollResult) => void
  /**
   * Rolagem preparada, vinda da ficha. Lida só ao montar: quem troca de preset
   * troca também a `key`, e o rolador começa de novo com ele.
   */
  preset?: DicePreset | null
  /** Controles a mais, acima do botão — o "só para mim" do Narrador. */
  children?: React.ReactNode
  isDisabled?: boolean
}

/**
 * O rolador: um pool só, montado com atalhos e rolado de uma vez.
 *
 * Duality, dados e modificador entram na mesma expressão. "Tirar" faz os
 * botões de dado subtraírem — a desvantagem é um −1d6, a vantagem um +1d6. A
 * ficha não rola direto: prepara o pool, e quem rola ainda pode ajustar.
 *
 * O sorteio é do `crypto` do navegador. Nada é gravado aqui — o resultado
 * volta para quem usa, que decide se vai para o aparelho ou para a mesa.
 */
export const DiceRoller = ({
  onRoll,
  preset = null,
  children,
  isDisabled = false,
  className,
  style,
}: DiceRollerProps) => {
  const [label, setLabel] = React.useState(preset?.label ?? "")
  const [expression, setExpression] = React.useState(preset?.expression ?? "")
  const [isSubtracting, setIsSubtracting] = React.useState(false)

  const pool = parseDicePool(expression)
  // Texto inválido não apaga o que se digitou: os atalhos partem do vazio só
  // quando a pessoa usa um deles.
  const base: DicePool = pool ?? EMPTY_POOL
  const canRoll = !isDisabled && pool !== null

  const update = (next: DicePool) => {
    setExpression(formatDicePool(next))
  }

  const handleRoll = () => {
    const result = rollPool(expression, label.trim(), cryptoDie)

    if (result) {
      onRoll(result)
    }
  }

  return (
    <section className={clsx(styles.roller, className)} style={style} aria-label="Rolar dados">
      <Input
        label="O QUE SE ROLA"
        value={label}
        placeholder="Opcional — Agility, dano, iniciativa…"
        maxLength={60}
        onValueChange={setLabel}
      />

      <p className={styles.quick}>
        <Chip
          label="Duality"
          isActive={base.hasDuality}
          onToggle={() => update({ ...base, hasDuality: !base.hasDuality })}
        />
        <Chip
          label="Vantagem +d6"
          isActive={false}
          disabled={!base.hasDuality}
          onToggle={() => update(addDieToPool(base, 6, 1))}
        />
        <Chip
          label="Desvantagem −d6"
          isActive={false}
          disabled={!base.hasDuality}
          onToggle={() => update(addDieToPool(base, 6, -1))}
        />
      </p>

      <p className={styles.quick}>
        {DIE_SIDES.map((sides) => (
          <Button
            key={sides}
            variant="outline"
            aria-label={`${isSubtracting ? "Tirar" : "Somar"} um d${sides}`}
            onClick={() => update(addDieToPool(base, sides, isSubtracting ? -1 : 1))}
          >
            {isSubtracting ? "−" : "+"}d{sides}
          </Button>
        ))}
        <Chip
          label="Tirar"
          isActive={isSubtracting}
          onToggle={() => setIsSubtracting(!isSubtracting)}
        />
      </p>

      <div className={styles.row}>
        <span className={styles.rowLabel}>MODIFICADOR</span>
        <Stepper
          label="modificador"
          decreaseLabel="Diminuir modificador"
          increaseLabel="Aumentar modificador"
          value={formatSigned(base.modifier)}
          onDecrease={() => update({ ...base, modifier: base.modifier - 1 })}
          onIncrease={() => update({ ...base, modifier: base.modifier + 1 })}
        />
      </div>

      <Input
        label="ROLAGEM"
        value={expression}
        placeholder="duality+2 ou 2d8+3"
        autoComplete="off"
        errorMessage={
          expression && !pool ? "Use duality, dados como 2d8 e números, com + e −." : undefined
        }
        onValueChange={setExpression}
      />

      {children}

      <div className={styles.actions}>
        <Button variant="outline" disabled={!expression} onClick={() => setExpression("")}>
          LIMPAR
        </Button>
        <Button disabled={!canRoll} onClick={handleRoll}>
          ROLAR
        </Button>
      </div>
    </section>
  )
}
