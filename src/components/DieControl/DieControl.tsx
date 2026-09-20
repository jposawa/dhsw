import { Button } from "@jposawa/ronin-ui"
import clsx from "clsx"

import type { BaseComponent } from "@/types"

import { DieShape } from "../DieShape"

import styles from "./DieControl.module.css"

type DieControlProps = BaseComponent & {
  dieSides: number
  /** A legenda e o nome falado do dado. O padrão é `D10` / "um d10". */
  caption?: string
  dieName?: string
  onAdd: () => void
  onSubtract: () => void
  /**
   * Troca o dado por outro. Só onde a medida é escolha — o de Hope e o de
   * Fear, que uma feature pode trocar. Sem isto a silhueta é só desenho.
   */
  onCycleSides?: () => void
}

/**
 * Um dado que se pode somar ou tirar: a silhueta com o `+` e o `−` dela.
 *
 * **Não sabe o que é um pool.** Recebe os dois gestos e avisa quem chamou, que
 * é quem decide o que eles fazem — assim ele serve ao rolador da página, ao da
 * mesa e a qualquer outro lugar que precise montar dados, sem arrastar a
 * lógica de rolagem para dentro de `components/`.
 *
 * Os dois botões ficam à vista, e não um botão com um modo de "tirar": somar e
 * tirar são a mesma escolha, e esconder metade dela num estado que não está na
 * tela obrigava a lembrar em que modo se estava.
 *
 * Quando o dado pode ser trocado, **a silhueta é o botão de troca**: a medida
 * corrente já está desenhada ali e escrita na legenda, e um terceiro controle
 * ao lado dos dois gestos frequentes cobraria espaço de quem nunca troca.
 */
export const DieControl = ({
  dieSides,
  caption,
  dieName,
  onAdd,
  onSubtract,
  onCycleSides,
  className,
  style,
}: DieControlProps) => {
  const name = dieName ?? `um d${dieSides}`

  const art = <DieShape className={styles.art} sides={dieSides} caption={caption ?? `D${dieSides}`} />

  return (
    <div className={clsx(styles.dieControl, className)} style={style}>
      {onCycleSides ? (
        <button
          type="button"
          className={styles.swap}
          aria-label={`Trocar o dado: ${name}`}
          onClick={onCycleSides}
        >
          {art}
        </button>
      ) : (
        art
      )}

      <span className={styles.buttons}>
        <Button
          className={styles.button}
          variant="outline"
          aria-label={`Somar ${name}`}
          onClick={onAdd}
        >
          +
        </Button>
        <Button
          className={styles.button}
          variant="outline"
          aria-label={`Tirar ${name}`}
          onClick={onSubtract}
        >
          −
        </Button>
      </span>
    </div>
  )
}
