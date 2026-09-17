import { Drawer, SectionLabel } from "@jposawa/ronin-ui"
import { useAtom } from "jotai"

import { LOCAL_ROLL_LIMIT } from "@/constants"
import { DiceRoller, RollLog } from "@/fragments"
import { addToHistory, createRollRecord } from "@/helpers"
import { usePartyRolls } from "@/hooks"
import { rollHistoryAtom } from "@/states"
import type { Character, DicePreset, RollResult } from "@/types"

import styles from "./RollDrawer.module.css"

type RollDrawerProps = {
  isOpen: boolean
  character: Character
  /** A rolagem que o toque na ficha preparou. `null` é rolagem solta. */
  preset: DicePreset | null
  onClose: () => void
}

/**
 * Rolar a partir da ficha. O toque num atributo ou numa arma só prepara o
 * rolador: quem rola ainda soma vantagem, tira um dado, muda o modificador.
 *
 * Ficha de mesa rola **na mesa**, sempre à vista de todos; ficha sem mesa
 * guarda no histórico deste aparelho, o mesmo da página de rolagem.
 */
export const RollDrawer = ({ isOpen, character, preset, onClose }: RollDrawerProps) => {
  const partyId = character.partyId
  const party = usePartyRolls(isOpen ? partyId : null, false)
  const [history, setHistory] = useAtom(rollHistoryAtom)
  const sheet = { id: character.id, name: character.name || "Sem nome" }

  const handleRoll = (result: RollResult) => {
    if (partyId) {
      party.roll(result, { sheet })

      return
    }

    setHistory(addToHistory(history, createRollRecord(result, { sheet }), LOCAL_ROLL_LIMIT))
  }

  return (
    <Drawer isOpen={isOpen} title="Rolar" onClose={onClose}>
      <section className={styles.layout} aria-label="Rolagem da ficha">
        {/* A key troca com o preset: cada toque na ficha começa um rolador novo. */}
        <DiceRoller
          key={preset ? `${preset.label}:${preset.expression}` : "livre"}
          preset={preset}
          onRoll={handleRoll}
        />

        <SectionLabel>
          <h3>{partyId ? "ROLAGENS DA MESA" : "ROLAGENS DESTE APARELHO"}</h3>
        </SectionLabel>

        <RollLog
          rolls={partyId ? party.rolls : history}
          showAuthor={Boolean(partyId)}
          emptyText="Nenhuma rolagem ainda."
        />
      </section>
    </Drawer>
  )
}
