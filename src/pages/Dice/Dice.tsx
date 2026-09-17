import { Button, SectionLabel } from "@jposawa/ronin-ui"
import { useAtom } from "jotai"

import { StepRule } from "@/components"
import { LOCAL_ROLL_LIMIT } from "@/constants"
import { DiceRoller, RollLog } from "@/fragments"
import { addToHistory, createRollRecord } from "@/helpers"
import { rollHistoryAtom } from "@/states"
import type { RollResult } from "@/types"

import styles from "./Dice.module.css"

/**
 * Rolagem avulsa, sem conta: o rolador e o histórico deste aparelho.
 *
 * O histórico fica só no navegador, cortado nas últimas rolagens. Rolagem de
 * mesa é outra coisa e vive na página do grupo, onde todos veem.
 */
export const Dice = () => {
  const [history, setHistory] = useAtom(rollHistoryAtom)

  const handleRoll = (result: RollResult) => {
    setHistory(addToHistory(history, createRollRecord(result), LOCAL_ROLL_LIMIT))
  }

  return (
    <main className={styles.page}>
      <StepRule />

      <DiceRoller onRoll={handleRoll} />

      <SectionLabel detail={`${history.length}/${LOCAL_ROLL_LIMIT}`}>
        <h2>HISTÓRICO DESTE APARELHO</h2>
      </SectionLabel>

      <RollLog rolls={history} emptyText="Nenhuma rolagem ainda." />

      {history.length > 0 ? (
        <Button variant="text" intent="danger" onClick={() => setHistory([])}>
          LIMPAR HISTÓRICO
        </Button>
      ) : null}
    </main>
  )
}
