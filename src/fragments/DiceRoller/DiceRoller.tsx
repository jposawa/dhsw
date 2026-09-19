import { Button, Input } from "@jposawa/ronin-ui"
import clsx from "clsx"
import React from "react"

import { DieControl, DieShape } from "@/components"
import { DIE_SIDES } from "@/constants"
import {
  addDieToPool,
  addDualityDie,
  canRollPool,
  cryptoDie,
  EMPTY_POOL,
  formatSigned,
  parseDicePool,
  removeDieFromPool,
  removeDualityDie,
  rollDicePool,
} from "@/helpers"
import type { BaseComponent, DicePool, DicePreset, DualityDie, RollResult } from "@/types"

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

  /**
   * O que está no campo enquanto se digita. `null` é "mostre o do pool": um
   * campo numérico controlado pelo número não deixa apagar para redigitar, nem
   * escrever o `-` antes do algarismo — os dois passam por estados que não são
   * número nenhum.
   */
  const [modifierText, setModifierText] = React.useState<string | null>(null)
  const modifierId = React.useId()

  const canRoll = !isDisabled && canRollPool(pool)
  const hasDice = pool.hope > 0 || pool.fear > 0 || pool.groups.length > 0
  const isClean = !hasDice && pool.modifier === 0

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

  /** Aceita o vazio e o sinal solto; o pool só muda quando já é número. */
  const changeModifier = (text: string) => {
    const cleaned = text.replace(/[^\d+-]/g, "").slice(0, 4)

    setModifierText(cleaned)

    if (/^[+-]?\d+$/.test(cleaned)) {
      change((current) => ({ ...current, modifier: Number(cleaned) }))

      return
    }

    if (cleaned === "" || cleaned === "-" || cleaned === "+") {
      change((current) => ({ ...current, modifier: 0 }))
    }
  }

  /** Os d12 de dualidade preparados, um por dado. */
  const duality: { key: string; die: DualityDie }[] = [
    ...Array.from({ length: pool.hope }, (_unused, index) => ({
      key: `hope-${index}`,
      die: "hope" as const,
    })),
    ...Array.from({ length: pool.fear }, (_unused, index) => ({
      key: `fear-${index}`,
      die: "fear" as const,
    })),
  ]

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

      {/* O par, num toque só: é assim que quase toda rolagem começa. O
          símbolo são os dois d12 nas cores deles — "Duality" escrito era o
          nome da regra, não o que entra no pool. */}
      <button
        type="button"
        className={styles.duality}
        aria-label="Somar os Duality Dice: um d12 de Hope e um de Fear"
        onClick={() => change((current) => addDualityDie(addDualityDie(current, "hope"), "fear"))}
      >
        <span className={styles.dualityArt}>
          <DieShape className={styles.hopeDie} sides={12} />
          <DieShape className={styles.fearDie} sides={12} />
        </span>
        <span className={styles.dualityLabel}>DUALITY</span>
      </button>

      <ul className={styles.dice} aria-label="Dados para somar ou tirar">
        {/* Hope e Fear à parte do par: a mesa às vezes pede um lado só, ou um
            Hope a mais, e isso não tem como sair de um botão de par. */}
        <li>
          <DieControl
            className={styles.hopeDie}
            dieSides={12}
            caption="HOPE"
            dieName="um d12 de Hope"
            onAdd={() => change((current) => addDualityDie(current, "hope"))}
            onSubtract={() => change((current) => removeDualityDie(current, "hope"))}
          />
        </li>
        <li>
          <DieControl
            className={styles.fearDie}
            dieSides={12}
            caption="FEAR"
            dieName="um d12 de Fear"
            onAdd={() => change((current) => addDualityDie(current, "fear"))}
            onSubtract={() => change((current) => removeDualityDie(current, "fear"))}
          />
        </li>

        {DIE_SIDES.map((sides) => (
          <li key={sides}>
            <DieControl
              dieSides={sides}
              onAdd={() => change((current) => addDieToPool(current, sides, 1))}
              onSubtract={() => change((current) => addDieToPool(current, sides, -1))}
            />
          </li>
        ))}
      </ul>

{/* O número se digita, além de subir pelo stepper: pôr +7 num stepper é
          sete toques, e o modificador de dano chega pronto da carta. */}
      <div className={styles.row}>
        <label className={styles.rowLabel} htmlFor={modifierId}>
          MODIFICADOR
        </label>

        <span className={styles.modifier}>
          <Button
            className={styles.modifierStep}
            variant="outline"
            aria-label="Diminuir modificador"
            onClick={() => change((current) => ({ ...current, modifier: current.modifier - 1 }))}
          >
            −
          </Button>

          <input
            className={styles.modifierInput}
            id={modifierId}
            type="text"
            inputMode="numeric"
            value={modifierText ?? formatSigned(pool.modifier)}
            aria-label="Modificador"
            onChange={(event) => changeModifier(event.target.value)}
            onBlur={() => setModifierText(null)}
          />

          <Button
            className={styles.modifierStep}
            variant="outline"
            aria-label="Aumentar modificador"
            onClick={() => change((current) => ({ ...current, modifier: current.modifier + 1 }))}
          >
            +
          </Button>
        </span>
      </div>

      <section className={styles.prepared} aria-label="Rolagem preparada">
        <span className={styles.rowLabel}>ROLAGEM PREPARADA</span>


        {hasDice ? (
          <ul className={styles.preparedList}>
{/* Um ícone por d12 de dualidade, cada um na cor dele e com o seu ×:
                o par não é mais indivisível, e mostrá-lo como bloco único
                esconderia o Hope extra que a mesa acabou de pedir. */}
            {duality.map(({ key, die }) => (
              <li className={styles.preparedItem} key={key}>
                <span className={styles.preparedSign} aria-hidden="true">
                  +
                </span>
                <DieShape
                  className={die === "hope" ? styles.hopeDie : styles.fearDie}
                  sides={12}
                  caption={die === "hope" ? "HOPE" : "FEAR"}
                  label={`um d12 de ${die === "hope" ? "Hope" : "Fear"}`}
                />
                <button
                  type="button"
                  className={styles.remove}
                  aria-label={`Tirar um d12 de ${die === "hope" ? "Hope" : "Fear"} da rolagem`}
                  onClick={() => change((current) => removeDualityDie(current, die))}
                >
                  ×
                </button>
              </li>
            ))}

            {prepared.map(({ key, sides, sign }) => (
              <li className={styles.preparedItem} key={key} data-subtracted={sign < 0 || undefined}>
                {/* O sinal é texto, não cor: somado e subtraído têm que se
                    distinguir sem depender de enxergar a diferença de tom. */}
                <span className={styles.preparedSign} aria-hidden="true">
                  {sign < 0 ? "−" : "+"}
                </span>
                <DieShape
                  sides={sides}
                  caption={`D${sides}`}
                  label={`${sign < 0 ? "menos " : "mais "}um d${sides}`}
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
          </ul>
        ) : (
          <p className={styles.empty}>Nenhum dado ainda.</p>
        )}
      </section>

      {children}

      <div className={styles.actions}>
        <Button
          variant="outline"
          disabled={isClean}
          onClick={() => {
            setPool(EMPTY_POOL)
            setModifierText(null)
          }}
        >
          LIMPAR
        </Button>
        <Button disabled={!canRoll} onClick={handleRoll}>
          ROLAR
        </Button>
      </div>
    </section>
  )
}
