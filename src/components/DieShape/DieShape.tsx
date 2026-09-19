import clsx from "clsx"
import type React from "react"

import type { BaseComponent } from "@/types"

import styles from "./DieShape.module.css"
import { DIE_SHAPE_FACETS, DIE_SHAPE_POINTS } from "./shapes"

type DieShapeProps = BaseComponent & {
  sides: number
  /**
   * A legenda embaixo da silhueta — `D10`, `HOPE`. Fica **fora** do polígono
   * porque dentro ela disputava espaço com as facetas e encolhia junto com o
   * ícone; num d4, onde a ponta é estreita, chegava a não caber.
   */
  caption?: string
  /** O que vai **dentro** do dado: o valor, quando ele já rolou. */
  children?: React.ReactNode
  /** Nome acessível. Sem ele a silhueta é decorativa e sai da árvore. */
  label?: string
}

/**
 * A silhueta de um dado: o contorno que se reconhece na mesa, com `Dn` embaixo.
 *
 * Serve para os dois lados da rolagem — escolher o dado que entra e ler o que
 * saiu. Com `children`, o valor rolado vai dentro do polígono; sem eles, é só o
 * dado como objeto.
 *
 * A cor **não** é decidida aqui: traço e texto são `currentColor`, então a
 * silhueta segue o estado de quem a contém — o botão apagado, o dado somado, o
 * subtraído, o d12 de Hope. Fixar cor aqui pediria uma prop por estado.
 *
 * O tamanho vem do `font-size` do contexto, como no `NavIcon`.
 */
export const DieShape = ({
  sides,
  caption,
  children,
  label,
  className,
  style,
}: DieShapeProps) => (
  <span
    className={clsx(styles.die, className)}
    style={style}
    role={label ? "img" : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
  >
    <span className={styles.art}>
      <svg
        className={styles.shape}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polygon points={DIE_SHAPE_POINTS[sides] ?? DIE_SHAPE_POINTS[6]} />

        {/* As facetas são o volume do dado e não informação: somem para quem lê
            a tela por som, e ficam mais apagadas que o contorno. */}
        {(DIE_SHAPE_FACETS[sides] ?? []).map((facet) => (
          <path className={styles.facet} key={facet} d={facet} />
        ))}
      </svg>

      {children === undefined ? null : <b className={styles.value}>{children}</b>}
    </span>

    {caption ? <span className={styles.caption}>{caption}</span> : null}
  </span>
)
