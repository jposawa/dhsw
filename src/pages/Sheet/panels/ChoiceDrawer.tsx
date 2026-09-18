import { Button } from "@jposawa/ronin-ui"
import type React from "react"

import type { Domain } from "@/types"

import { WideDrawer } from "@/fragments"
import { domainStripeStyle } from "@/helpers"

import styles from "./Identity.module.css"

export type ChoiceOption = {
  name: string
  /** O que a escolha guarda, quando não é o nome na tela. */
  value?: string
  meta?: React.ReactNode
  body: React.ReactNode
  /**
   * Faixa à esquerda: os domínios da entidade. Um pinta a faixa inteira; dois
   * dividem meio a meio. Vazio fica no cromo.
   */
  stripeDomains?: readonly Domain[]
}

type ChoiceDrawerProps = {
  isOpen: boolean
  title: string
  /** Uma linha acima da lista, quando a escolha precisa de contexto. */
  note?: string
  options: readonly ChoiceOption[]
  current: string | null
  onChoose: (name: string) => void
  onClose: () => void
}

/**
 * As opções de uma escolha de identidade, cada uma com o que ela traz.
 *
 * A escolha atual aparece marcada no lugar do botão: escolher de novo o mesmo
 * não faz nada, e um botão que não faz nada é ruído.
 */
export const ChoiceDrawer = ({
  isOpen,
  title,
  note,
  options,
  current,
  onChoose,
  onClose,
}: ChoiceDrawerProps) => (
  <WideDrawer isOpen={isOpen} title={title} onClose={onClose}>
    <div className={styles.drawerBody}>
      {note ? <p className={styles.drawerNote}>{note}</p> : null}

      <ul className={styles.options}>
        {options.map((option) => {
          const value = option.value ?? option.name
          const isCurrent = value === current

          return (
            <li
              key={value}
              className={styles.option}
              data-current={isCurrent || undefined}
              style={domainStripeStyle(option.stripeDomains)}
            >
              <article className={styles.optionBody}>
                <header className={styles.optionHead}>
                  <hgroup className={styles.optionTitle}>
                    <h4 className={styles.optionName}>{option.name}</h4>
                    {option.meta ? <p className={styles.optionMeta}>{option.meta}</p> : null}
                  </hgroup>

                  {isCurrent ? (
                    <span className={styles.currentTag}>ATUAL</span>
                  ) : (
                    <Button
                      variant="outline"
                      aria-label={`Escolher ${option.name}`}
                      onClick={() => onChoose(value)}
                    >
                      ESCOLHER
                    </Button>
                  )}
                </header>

                {option.body}
              </article>
            </li>
          )
        })}
      </ul>
    </div>
  </WideDrawer>
)
