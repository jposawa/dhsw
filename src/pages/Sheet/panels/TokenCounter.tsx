import { Stepper } from "@jposawa/ronin-ui"

import { MarkerTrack } from "@/fragments"
import { domainColorToken } from "@/helpers"
import type { ActiveTokenPool } from "@/rules"
import type { TokenRefill } from "@/types"

import styles from "./TokenCounter.module.css"

const REFILL_HINT: Readonly<Record<TokenRefill, string>> = {
  rest: "Voltam em qualquer descanso.",
  longRest: "Voltam no descanso longo.",
  manual: "Voltam quando a carta diz — ajuste à mão.",
}

const ACCUMULATOR_HINT: Readonly<Record<TokenRefill, string>> = {
  rest: "Zeram em qualquer descanso.",
  longRest: "Zeram no descanso longo.",
  manual: "Não zeram sozinhos.",
}

type TokenCounterProps = {
  active: ActiveTokenPool
  count: number
  onChange: (next: number) => void
}

/**
 * Os tokens de uma feature ou carta, desta ficha.
 *
 * Com teto, são pips como os de HP: aceso é token disponível, e tocar ajusta o
 * total. Acumulador não tem teto para desenhar, então é um contador.
 */
export const TokenCounter = ({ active, count, onChange }: TokenCounterProps) => {
  const color = active.domain ? domainColorToken(active.domain) : "var(--color-chrome)"

  return (
    <section className={styles.counter} aria-label={`Tokens de ${active.name}`}>
      {active.max === null ? (
        <p className={styles.accumulator}>
          <span className={styles.label}>TOKENS</span>
          <Stepper
            label={`tokens de ${active.name}`}
            decreaseLabel={`Tirar token de ${active.name}`}
            increaseLabel={`Pôr token em ${active.name}`}
            value={String(count)}
            canDecrease={count > 0}
            onDecrease={() => onChange(count - 1)}
            onIncrease={() => onChange(count + 1)}
          />
        </p>
      ) : (
        <MarkerTrack
          label="TOKENS"
          hasCount
          marked={count}
          max={active.max}
          color={color}
          emptyText="Nenhum token nesta escala."
          onChange={onChange}
        />
      )}

      <p className={styles.hint}>
        {active.max === null
          ? ACCUMULATOR_HINT[active.pool.refill]
          : REFILL_HINT[active.pool.refill]}
      </p>
    </section>
  )
}
