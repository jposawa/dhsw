import React from "react"

import { Die } from "@/components"
import { formatSigned } from "@/helpers"
import { describeRoll } from "@/rules"
import type { RollRecord } from "@/types"

import styles from "./RollLog.module.css"

type RollEntryProps = {
  record: RollRecord
  /** A última rolagem: detalhe sempre aberto, sem botão. */
  isHighlighted: boolean
  showAuthor: boolean
}

const timeOf = (createdAt: number): string => {
  const date = new Date(createdAt)
  const time = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })

  return date.toDateString() === new Date().toDateString()
    ? time
    : `${date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} ${time}`
}

/** Uma rolagem do histórico: a linha de resumo e, aberta, os dados um a um. */
export const RollEntry = ({ record, isHighlighted, showAuthor }: RollEntryProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const detailsId = React.useId()
  const hasDetails = isHighlighted || isOpen

  const meta = [
    showAuthor ? record.author?.name : null,
    record.sheet?.name,
    timeOf(record.createdAt),
    record.visibility === "gm" ? "só Narrador" : null,
  ]
    .filter(Boolean)
    .join(" · ")

  const summary = (
    <span className={styles.summary}>
      <b className={styles.summaryText}>{describeRoll(record)}</b>
      <span className={styles.meta}>{meta}</span>
    </span>
  )

  return (
    <li
      className={styles.entry}
      data-outcome={record.outcome ?? undefined}
      data-highlighted={isHighlighted || undefined}
    >
      {isHighlighted ? (
        summary
      ) : (
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={isOpen}
          aria-controls={detailsId}
          onClick={() => setIsOpen(!isOpen)}
        >
          {summary}
          <i className={styles.chevron} aria-hidden="true">
            {isOpen ? "−" : "+"}
          </i>
        </button>
      )}

      {hasDetails ? (
        <div className={styles.details} id={detailsId}>
          <p className={styles.dice}>
            {record.dice.map((die, index) => (
              <Die
                key={index}
                sides={die.sides}
                value={die.value}
                role={die.role}
                isSubtracted={die.isSubtracted}
              />
            ))}
            {record.modifier === 0 ? null : (
              <span className={styles.modifier}>{formatSigned(record.modifier)}</span>
            )}
          </p>
          <p className={styles.expression}>{record.expression}</p>
        </div>
      ) : null}
    </li>
  )
}
