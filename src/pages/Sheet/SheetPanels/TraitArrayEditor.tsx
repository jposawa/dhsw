import { Button, SectionLabel, Select } from "@jposawa/ronin-ui"
import clsx from "clsx"
import { LuDices } from "react-icons/lu"

import { TRAIT_LIST } from "@/constants"
import {
  assignTraitValue,
  clearTraitValue,
  cryptoDie,
  formatSigned,
  isTraitArrayDistributed,
  NO_TRAITS,
  remainingTraitValues,
  rollTraitArray,
  traitArrayOf,
} from "@/helpers"
import type { BaseComponent, Character, DerivedStats, HouseRules, Trait } from "@/types"

import styles from "./TraitArrayEditor.module.css"

/** O valor da opção que devolve o atributo ao monte. */
const CLEAR = ""

type TraitArrayEditorProps = BaseComponent & {
  draft: Character
  derived: DerivedStats
  houseRules: HouseRules
  onChange: (mutate: (current: Character) => Character) => void
}

/**
 * Os seis atributos: o array do livro, espalhado.
 *
 * O livro **não** dá pontos a comprar — dá seis valores e manda distribuí-los
 * (p. 16). Por isso não há `+`/`−` por atributo: um stepper convida a somar
 * até onde se quiser, que é outro jogo.
 *
 * Cada atributo é uma lista com **o que ainda está no monte**, mais o que ele
 * já tem e a opção de devolver. Mostrar os seis valores em cada um dos seis
 * atributos dava trinta e seis alvos na tela e nenhuma pista de quais ainda
 * estavam livres.
 *
 * Com a regra da casa o array é sorteado, e o botão de sortear fica à vista:
 * re-rolar é decisão de mesa e não pode ficar escondida.
 */
export const TraitArrayEditor = ({
  draft,
  derived,
  houseRules,
  onChange,
  className,
  style,
}: TraitArrayEditorProps) => {
  const array = traitArrayOf(draft)
  const remaining = remainingTraitValues(draft)
  const isDistributed = isTraitArrayDistributed(draft)

  /**
   * As opções deste atributo: o que sobrou, sem repetir — dois zeros no monte
   * são uma linha só, porque escolher "+0" é escolher um deles — mais o que
   * ele já tem, para a lista mostrar o valor corrente, e o "—" que o devolve.
   */
  const optionsFor = (trait: Trait) => {
    const assigned = draft.traits[trait]
    const free = [...new Set(remaining)]
    const values = assigned === null ? free : [...new Set([assigned, ...free])]

    return [
      ...values
        .sort((a, b) => b - a)
        .map((value) => ({ value: String(value), label: formatSigned(value) })),
      ...(assigned === null ? [] : [{ value: CLEAR, label: "—" }]),
    ]
  }

  const pick = (trait: Trait, value: string) => {
    onChange((current) =>
      value === CLEAR
        ? clearTraitValue(current, trait)
        : assignTraitValue(current, trait, Number(value)),
    )
  }

  const rollArray = () => {
    const rolled = rollTraitArray(cryptoDie)

    onChange((current) => ({
      ...current,
      traitArray: rolled,
      // A distribuição antiga não vale para o array novo: os valores mudaram,
      // e adivinhar onde cada um iria seria escolher pela mesa.
      traits: NO_TRAITS,
    }))
  }

  return (
    <section className={clsx(styles.editor, className)} style={style} aria-label="Atributos">
      <SectionLabel detail={array.map(formatSigned).join("  ")}>
        <h3>ATRIBUTOS</h3>
      </SectionLabel>

      {!isDistributed && (
        <p className={styles.warning}>Falta distribuir: {remaining.map(formatSigned).join(", ")}.</p>
      )}

      <ul className={styles.traits}>
        {TRAIT_LIST.map((trait) => {
          const stat = derived.traits[trait]
          const assigned = draft.traits[trait]

          return (
            <li
              className={styles.trait}
              key={trait}
              data-spellcast={derived.spellcastTrait === trait || undefined}
            >
              <span className={styles.name}>{trait}</span>

              {/* O campo mostra só o número: é um valor de duas casas, e um
                  campo de formulário de largura cheia para isso enchia a tela
                  de moldura. O nome fica em cima, como na ficha do livro. */}
              <Select
                className={styles.pick}
                options={optionsFor(trait)}
                value={assigned === null ? null : String(assigned)}
                placeholder="—"
                aria-label={trait}
                onValueChange={(value) => pick(trait, value)}
              />

              {assigned !== null && stat.total !== assigned && (
                <span className={styles.total}>{formatSigned(stat.total)} com mods</span>
              )}

              {derived.spellcastTrait === trait && (
                <span className={styles.spellcast}>FORCEWIELDING</span>
              )}
            </li>
          )
        })}
      </ul>

      {houseRules.hasRolledTraitArray && (
        <Button className={styles.roll} variant="outline" onClick={rollArray}>
          <LuDices aria-hidden="true" />
          &nbsp;SORTEAR ARRAY
        </Button>
      )}
    </section>
  )
}
