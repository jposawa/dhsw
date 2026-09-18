import clsx from "clsx"

import type { BaseComponent } from "@/types"

import styles from "./DieShape.module.css"
import { DIE_SHAPE_FACETS, DIE_SHAPE_POINTS } from "./shapes"

type DieShapeProps = BaseComponent & {
  sides: number
  /** Rótulo para leitor de tela. Sem ele a silhueta é decorativa. */
  label?: string
}

/**
 * A silhueta de um dado, com o número de faces dentro dela.
 *
 * É o dado como objeto, não como resultado: serve para escolher o que entra na
 * rolagem e para ver o que já entrou. `components/Die` é o outro — o dado que
 * já rolou, com o valor.
 *
 * A cor **não** é decidida aqui: traço e texto são `currentColor`, então a
 * silhueta segue o estado de quem a contém — o botão apagado, o dado somado,
 * o subtraído. Fixar cor aqui pediria uma prop por estado.
 *
 * O tamanho vem do `font-size` do contexto, como no `NavIcon`.
 */
export const DieShape = ({ sides, label, className, style }: DieShapeProps) => (
  <svg
    className={clsx(styles.shape, className)}
    style={style}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinejoin="round"
    role={label ? "img" : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
  >
    <polygon points={DIE_SHAPE_POINTS[sides] ?? DIE_SHAPE_POINTS[6]} />

    {/* As facetas são o volume do dado e não informação: some para quem lê a
        tela por som, e some também quando o ícone fica pequeno demais. */}
    {(DIE_SHAPE_FACETS[sides] ?? []).map((facet) => (
      <path className={styles.facet} key={facet} d={facet} />
    ))}

    {/* O d4 é o único que não se equilibra no meio do quadro: a ponta é
        estreita e o número cabe na base. */}
    <text
      className={styles.label}
      x="12"
      y={sides === 4 ? 15.5 : 12.5}
      textAnchor="middle"
      dominantBaseline="middle"
    >
      {sides}
    </text>
  </svg>
)
