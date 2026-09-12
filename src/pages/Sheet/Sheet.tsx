import { Button, Modal, Tabs } from "@jposawa/ronin-ui"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import React from "react"
import { Navigate, useParams } from "react-router-dom"

import { StepRule } from "@/components"
import { ROUTES, RULE_ERROR_MESSAGES, SHEET_TABS } from "@/constants"
import { SaveState } from "@/fragments"
import { hasSheetEdits, touchCharacter } from "@/helpers"
import { useCompendium } from "@/hooks"
import { derive } from "@/rules"
import { houseRulesAtom, rosterAtom, sheetRolesAtom, toastAtom } from "@/states"
import type { Character, Marks, Result, SheetTabId } from "@/types"

import { CardsPanel, CombatEdit, CombatPlay, HistoryPanel, InventoryPanel } from "./panels"

import styles from "./Sheet.module.css"

/**
 * A ficha. Combate abre primeiro: é a tela usada em 80% do tempo de sessão.
 *
 * Nenhum número aqui é guardado — todos saem de `derive`, e cada `StatBlock`
 * abre mostrando base + modificadores + total.
 *
 * **Editar ficha é um estado, não um interruptor.** Fora dele a ficha é de
 * mesa: marcar HP, trocar carta do loadout, equipar arma — jogadas, que
 * acontecem no meio de um turno e gravam no toque, porque pedir confirmação
 * ali seria um passo em cima do gesto mais frequente do app.
 *
 * Dentro dele mexe-se no que **define** a ficha: nome, nível, classe, atributo,
 * que cartas se sabe, o que se carrega, a história. Nada disso chega ao roster
 * sem SALVAR, e CANCELAR devolve tudo ao que estava. É um rascunho só para as
 * quatro abas — quem edita a classe e a mochila na mesma ida salva uma vez.
 */
export const Sheet = () => {
  const { sheetId } = useParams<{ sheetId: string }>()
  const [roster, setRoster] = useAtom(rosterAtom)
  const houseRules = useAtomValue(houseRulesAtom)
  const sheetRoles = useAtomValue(sheetRolesAtom)
  const setToast = useSetAtom(toastAtom)
  const { compendium } = useCompendium()

  const [tab, setTab] = React.useState<SheetTabId>("combate")
  const [draft, setDraft] = React.useState<Character | null>(null)
  const [isConfirmingCancel, setIsConfirmingCancel] = React.useState(false)

  const character = sheetId ? roster.characters[sheetId] : undefined

  // Papel ausente = ficha local ainda não sincronizada, e ela é sua.
  const isReadOnly = sheetId ? sheetRoles[sheetId] === "reader" : false

  const commit = (next: Character) => {
    setRoster({
      ...roster,
      characters: { ...roster.characters, [next.id]: touchCharacter(next) },
    })
  }

  if (!character) {
    return <Navigate to={ROUTES.roster} replace />
  }

  const isEditing = draft !== null
  // Editando, tudo se calcula sobre o rascunho: é o que faz Evasion e HP
  // mudarem enquanto se escolhe a classe, antes de confirmar.
  const shown = draft ?? character
  const derived = derive(shown, houseRules, compendium)
  const isDirty = draft !== null && hasSheetEdits(draft, character)

  /**
   * Aplica um `Result` de `rules/`.
   *
   * Recusa vira toast com a mensagem em pt-br do código — a tela nunca
   * reimplementa a condição, só renderiza o que a regra permitiu.
   * Editando, o resultado vai para o rascunho; em mesa, direto para o roster.
   */
  const applyResult = (result: Result<Character>) => {
    if (!result.ok) {
      setToast(RULE_ERROR_MESSAGES[result.code])

      return
    }

    if (isReadOnly) {
      setToast("Você é leitor desta ficha: nada aqui é salvo.")

      return
    }

    if (draft) {
      setDraft(result.value)

      return
    }

    commit(result.value)
  }

  const changeDraft = (mutate: (current: Character) => Character) => {
    setDraft((current) => (current ? mutate(current) : current))
  }

  const handleMarksChange = (marks: Marks) => {
    if (isReadOnly) {
      // Barrado num lugar só. Deixar passar gravaria local e falharia no
      // servidor — a regra de segurança recusa escrita de nível 10 — e a
      // pessoa veria a mudança sumir no próximo login, sem explicação.
      return
    }

    commit({ ...character, marks })
  }

  const requestCancel = () => {
    if (isDirty) {
      setIsConfirmingCancel(true)

      return
    }

    setDraft(null)
  }

  const handleSave = () => {
    if (draft) {
      commit(draft)
    }

    setDraft(null)
  }

  const panelFor = (tabId: SheetTabId): React.ReactNode => {
    if (tabId === "combate") {
      return isEditing && draft ? (
        <CombatEdit draft={draft} derived={derived} onChange={changeDraft} />
      ) : (
        <CombatPlay character={character} derived={derived} onMarksChange={handleMarksChange} />
      )
    }

    if (tabId === "cartas") {
      return (
        <CardsPanel
          character={shown}
          derived={derived}
          isEditing={isEditing}
          onApply={applyResult}
        />
      )
    }

    if (tabId === "inventario") {
      return (
        <InventoryPanel character={shown} derived={derived} onApply={applyResult} />
      )
    }

    return (
      <HistoryPanel
        character={shown}
        isEditing={isEditing}
        onApply={applyResult}
        onChange={changeDraft}
      />
    )
  }

  return (
    <main className={styles.page}>
      <div className={styles.toolbar}>
        {isReadOnly ? (
          <p className={styles.note}>Você é leitor: dá para ver tudo, nada é salvo.</p>
        ) : (
          <SaveState className={styles.saveState} sheetId={character.id} />
        )}

        {/* Um botão, e não um alternador de dois estados: editar é uma coisa
            que se faz e se termina — com o resultado salvo ou cancelado —,
            não um lugar em que se fica. */}
        {isEditing ? null : (
          <Button variant="outline" disabled={isReadOnly} onClick={() => setDraft(character)}>
            EDITAR FICHA
          </Button>
        )}
      </div>

      <StepRule />

      <Tabs
        className={styles.tabs}
        hideArrows
        hideDots
        activeTabId={tab}
        onTabChange={(tabId) => setTab(tabId as SheetTabId)}
        tabs={SHEET_TABS.map((sheetTab) => ({
          id: sheetTab.id,
          label: sheetTab.label,
          content: panelFor(sheetTab.id),
        }))}
      />

      {/*
        Grudada no fundo da janela enquanto se edita.
        As quatro abas são mais altas que a tela, e um Salvar no fim do
        documento só aparece para quem rolar até lá.
      */}
      {isEditing ? (
        <div className={styles.saveBar}>
          <p className={styles.saveHint}>
            {isDirty ? "Alterações não salvas" : "Nada alterado"}
          </p>
          <div className={styles.saveActions}>
            <Button variant="outline" onClick={requestCancel}>
              CANCELAR
            </Button>
            <Button disabled={!isDirty} onClick={handleSave}>
              SALVAR
            </Button>
          </div>
        </div>
      ) : null}

      {/* `isPersistent` porque cancelar é irreversível: sair clicando no fundo
          é exatamente o acidente a evitar. */}
      <Modal
        isOpen={isConfirmingCancel}
        isPersistent
        title="Descartar as alterações?"
        onClose={() => setIsConfirmingCancel(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsConfirmingCancel(false)}>
              CONTINUAR EDITANDO
            </Button>
            <Button
              intent="danger"
              onClick={() => {
                setIsConfirmingCancel(false)
                setDraft(null)
              }}
            >
              DESCARTAR
            </Button>
          </>
        }
      >
        <p className={styles.note}>
          O que você mudou nesta ficha ainda não foi salvo. Descartando, ela volta ao que
          estava.
        </p>
      </Modal>
    </main>
  )
}
