import { Button } from "@jposawa/ronin-ui"
import { useSetAtom } from "jotai"
import React from "react"

import { DEFAULT_HOUSE_RULES } from "@/constants"
import { HouseRulesForm } from "@/fragments"
import { savePartyHouseRules } from "@/services"
import { toastAtom } from "@/states"
import type { HouseRules } from "@/types"

import styles from "./PartyDetail.module.css"

type PartyRulesProps = {
  partyId: string
  /** As regras gravadas, ao vivo. `null` em mesa que ainda não tem. */
  houseRules: HouseRules | null
  isNarrator: boolean
}

/**
 * As regras da casa da mesa. Valem para toda ficha dela, no lugar das da ficha.
 *
 * O Narrador edita num rascunho e grava com Salvar: a mudança recalcula a ficha
 * de todo mundo na hora, e um toque errado não pode fazer isso sozinho.
 */
export const PartyRules = ({ partyId, houseRules, isNarrator }: PartyRulesProps) => {
  const setToast = useSetAtom(toastAtom)
  const current = { ...DEFAULT_HOUSE_RULES, ...houseRules }

  const [draft, setDraft] = React.useState<HouseRules | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)

  const shown = draft ?? current
  const isDirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(current)

  const handleSave = async () => {
    if (!draft) {
      return
    }

    setIsSaving(true)

    try {
      await savePartyHouseRules(partyId, draft)
      setDraft(null)
      setToast("Regras da mesa salvas")
    } catch {
      setToast("Não foi possível salvar as regras.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className={styles.reading} aria-label="Regras da mesa">
      <p className={styles.note}>
        Valem para todas as fichas desta mesa, no lugar das regras de cada ficha. Uma ficha
        que sai da mesa leva estas regras com ela.
        {isNarrator ? null : " Quem ajusta é o Narrador."}
      </p>

      <HouseRulesForm value={shown} onChange={isNarrator ? setDraft : undefined} />

      {isNarrator ? (
        <div className={styles.saveRow}>
          <Button variant="outline" disabled={!isDirty || isSaving} onClick={() => setDraft(null)}>
            DESCARTAR
          </Button>
          <Button disabled={!isDirty || isSaving} onClick={() => void handleSave()}>
            {isSaving ? "SALVANDO…" : "SALVAR REGRAS"}
          </Button>
        </div>
      ) : null}
    </section>
  )
}
