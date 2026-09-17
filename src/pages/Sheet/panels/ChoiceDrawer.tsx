import { Button, Drawer } from "@jposawa/ronin-ui"
import type React from "react"

import styles from "./Identity.module.css"

export type ChoiceOption = {
  name: string
  meta?: React.ReactNode
  body: React.ReactNode
  /** Faixa à esquerda: cor do domínio da classe, quando há. */
  stripeColor?: string
}

type ChoiceDrawerProps = {
  isOpen: boolean
  title: string
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
  options,
  current,
  onChoose,
  onClose,
}: ChoiceDrawerProps) => (
  <Drawer isOpen={isOpen} title={title} onClose={onClose}>
    <ul className={styles.options}>
      {options.map((option) => {
        const isCurrent = option.name === current

        return (
          <li
            key={option.name}
            className={styles.option}
            data-current={isCurrent || undefined}
            style={
              option.stripeColor
                ? ({
                    "--domain-color": option.stripeColor,
                  } as React.CSSProperties)
                : undefined
            }
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
                    onClick={() => onChoose(option.name)}
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
  </Drawer>
)
