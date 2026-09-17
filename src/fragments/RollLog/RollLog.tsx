import clsx from "clsx"

import type { BaseComponent, RollRecord } from "@/types"

import { RollEntry } from "./RollEntry"

import styles from "./RollLog.module.css"

type RollLogProps = BaseComponent & {
  /** Da mais nova para a mais antiga. */
  rolls: readonly RollRecord[]
  emptyText: string
  /** Na mesa, quem rolou importa; no aparelho, é sempre quem está olhando. */
  showAuthor?: boolean
}

/**
 * O histórico de rolagens. A última aparece aberta, com os dados; as outras
 * são uma linha cada, e abrem no toque — o texto final é o que se procura
 * rolando a lista, e o detalhe, só às vezes.
 */
export const RollLog = ({ rolls, emptyText, showAuthor = false, className, style }: RollLogProps) =>
  rolls.length === 0 ? (
    <p className={clsx(styles.empty, className)} style={style}>
      {emptyText}
    </p>
  ) : (
    <ol className={clsx(styles.log, className)} style={style} aria-label="Rolagens">
      {rolls.map((record, index) => (
        <RollEntry
          key={record.id}
          record={record}
          isHighlighted={index === 0}
          showAuthor={showAuthor}
        />
      ))}
    </ol>
  )
