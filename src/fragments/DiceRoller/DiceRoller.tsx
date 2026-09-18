import { Button, Chip, Input, Stepper } from "@jposawa/ronin-ui"
import clsx from "clsx"
import React from "react"

import { DieShape } from "@/components"
import { DIE_SIDES } from "@/constants"
import { formatSigned } from "@/helpers"
import {
  addDieToPool,
  canRollPool,
  cryptoDie,
  type DicePool,
  EMPTY_POOL,
  parseDicePool,
  removeDieFromPool,
  rollDicePool,
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
 * O rolador: os dados que se vai jogar, montados um a um.
 *
 * **Não há campo de fórmula.** O pool é o estado, e a tela mostra os dados
 * dele; escrever `2d8+3` num campo era pedir que a pessoa soubesse uma sintaxe
 * para dizer o que dois toques dizem, e obrigava a passar toda interação por
 * um parser. Ele continua existindo para a rolagem preparada que chega da
 * ficha como texto — essa entra uma vez, na montagem, e vira pool.
 *
 * Cada dado aparece com **+ e − à vista**: somar e tirar são a mesma escolha,
 * e um interruptor de "tirar" escondia metade dela num estado que não estava
 * na tela. Com os Duality Dice no pool, o d6 somado é vantagem e o subtraído é
 * desvantagem — é a regra, não um botão à parte.
 *
 * O que está preparado vira ícone com ×, um por dado. O que não dá para rolar
 * — pool sem dado, ou só de dados subtraídos — é `rules/dice.ts` quem decide.
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
  const [pool, setPool] = React.useState<DicePool>(
    () => (preset?.expression ? parseDicePool(preset.expression) : null) ?? EMPTY_POOL,
  )

  const canRoll = !isDisabled && canRollPool(pool)
  const isEmpty = !pool.hasDuality && pool.groups.length === 0 && pool.modifier === 0

  const handleRoll = () => {
    onRoll(rollDicePool(pool, label.trim(), cryptoDie))
  }

  /*
   * Toda mudança parte do pool **atual** e não do que este render enxerga:
   * tocar duas vezes no + do mesmo dado acontece dentro de um render só, e com
   * o pool do fechamento o segundo toque se perdia — somava o mesmo dado uma
   * vez, não duas.
   */
  const change = (mutate: (current: DicePool) => DicePool) => {
    setPool(mutate)
  }

  /** Os dados preparados, um ícone por dado — e não um por grupo. */
  const prepared = pool.groups.flatMap((group) =>
    Array.from({ length: group.count }, (_unused, index) => ({
      key: `${group.sign}d${group.sides}-${index}`,
      sides: group.sides,
      sign: group.sign,
    })),
  )

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
          isActive={pool.hasDuality}
          onToggle={() => change((current) => ({ ...current, hasDuality: !current.hasDuality }))}
        />
      </p>

      <ul className={styles.dice} aria-label="Dados para somar ou tirar">
        {DIE_SIDES.map((sides) => (
          <li className={styles.dieCell} key={sides}>
            <DieShape className={styles.dieArt} sides={sides} />

            <span className={styles.dieButtons}>
              <Button
                className={styles.dieButton}
                variant="outline"
                aria-label={`Somar um d${sides}`}
                onClick={() => change((current) => addDieToPool(current, sides, 1))}
              >
                +
              </Button>
              <Button
                className={styles.dieButton}
                variant="outline"
                aria-label={`Tirar um d${sides}`}
                onClick={() => change((current) => addDieToPool(current, sides, -1))}
              >
                −
              </Button>
            </span>
          </li>
        ))}
      </ul>

      <div className={styles.row}>
        <span className={styles.rowLabel}>MODIFICADOR</span>
        <Stepper
          label="modificador"
          decreaseLabel="Diminuir modificador"
          increaseLabel="Aumentar modificador"
          value={formatSigned(pool.modifier)}
          onDecrease={() => change((current) => ({ ...current, modifier: current.modifier - 1 }))}
          onIncrease={() => change((current) => ({ ...current, modifier: current.modifier + 1 }))}
        />
      </div>

      <section className={styles.prepared} aria-label="Rolagem preparada">
        <span className={styles.rowLabel}>ROLAGEM PREPARADA</span>

        {isEmpty ? (
          <p className={styles.empty}>Nenhum dado ainda.</p>
        ) : (
          <ul className={styles.preparedList}>
            {pool.hasDuality ? (
              <li className={styles.preparedItem} data-duality>
                <span className={styles.preparedDuality}>
                  <DieShape className={styles.preparedArt} sides={12} />
                  <DieShape className={styles.preparedArt} sides={12} />
                </span>
                <button
                  type="button"
                  className={styles.remove}
                  aria-label="Tirar os Duality Dice da rolagem"
                  onClick={() => change((current) => ({ ...current, hasDuality: false }))}
                >
                  ×
                </button>
              </li>
            ) : null}

            {prepared.map(({ key, sides, sign }) => (
              <li className={styles.preparedItem} key={key} data-subtracted={sign < 0 || undefined}>
                <DieShape
                  className={styles.preparedArt}
                  sides={sides}
                  label={`${sign < 0 ? "menos " : ""}um d${sides}`}
                />
                <button
                  type="button"
                  className={styles.remove}
                  aria-label={`Tirar um d${sides} da rolagem`}
                  onClick={() => change((current) => removeDieFromPool(current, sides, sign))}
                >
                  ×
                </button>
              </li>
            ))}

            {pool.modifier === 0 ? null : (
              <li className={styles.preparedItem}>
                <span className={styles.preparedModifier}>{formatSigned(pool.modifier)}</span>
                <button
                  type="button"
                  className={styles.remove}
                  aria-label="Zerar o modificador"
                  onClick={() => change((current) => ({ ...current, modifier: 0 }))}
                >
                  ×
                </button>
              </li>
            )}
          </ul>
        )}
      </section>

      {children}

      <div className={styles.actions}>
        <Button variant="outline" disabled={isEmpty} onClick={() => setPool(EMPTY_POOL)}>
          LIMPAR
        </Button>
        <Button disabled={!canRoll} onClick={handleRoll}>
          ROLAR
        </Button>
      </div>
    </section>
  )
}
