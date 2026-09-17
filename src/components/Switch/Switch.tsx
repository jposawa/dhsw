import clsx from "clsx"

import type { BaseComponent } from "@/types"

import styles from "./Switch.module.css"

type SwitchProps = BaseComponent & {
  isOn: boolean
  onToggle: () => void
  /** O rótulo visível, à esquerda do trilho. */
  children: React.ReactNode
  disabled?: boolean
}

/**
 * Uma preferência ligada ou desligada.
 *
 * **`role="switch"`, não `aria-pressed`.** Os dois são estados binários, mas
 * dizem coisas diferentes: `aria-pressed` é um botão que ficou apertado — uma
 * *ação* em curso — e `switch` é um valor que está ligado. Tema é valor, e a
 * diferença aparece na leitura: "Tema escuro, ligado" contra "Tema escuro,
 * alternar, pressionado".
 *
 * O botão inteiro é o alvo, e o trilho é `aria-hidden`: quem lê por áudio já
 * recebe o estado pelo `aria-checked`, e anunciar o desenho de novo seria a
 * mesma informação duas vezes.
 *
 * Fica local porque a ronin-ui 0.1.1 não exporta interruptor — ela tem `Chip`
 * (um filtro que se aperta) e `Button`, que são as outras duas coisas.
 */
export const Switch = ({
  isOn,
  onToggle,
  children,
  disabled = false,
  className,
  style,
}: SwitchProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={isOn}
    disabled={disabled}
    className={clsx(styles.switch, className)}
    style={style}
    data-testid="switch"
    onClick={onToggle}
  >
    <span className={styles.label}>{children}</span>
    <span className={styles.track} aria-hidden="true">
      <span className={styles.thumb} />
    </span>
  </button>
)
