import { Button, Modal, Tabs } from "@jposawa/ronin-ui"
import { useAtom, useAtomValue } from "jotai"
import React from "react"
import { Navigate, useParams } from "react-router-dom"

import { StepRule } from "@/components"
import { ROUTES, SHEET_TABS } from "@/constants"
import { SaveState } from "@/fragments"
import { hasSheetEdits, touchCharacter } from "@/helpers"
import { derive } from "@/rules"
import { houseRulesAtom, rosterAtom, sheetRolesAtom } from "@/states"
import type { Character, Marks, SheetMode, SheetTabId } from "@/types"

import { EditPanel, PlayPanel } from "./panels"

import styles from "./Sheet.module.css"

/**
 * A ficha. Combate abre primeiro: é a tela usada em 80% do tempo de sessão.
 *
 * Nenhum número aqui é guardado — todos saem de `derive`, e cada `StatBlock`
 * abre mostrando base + modificadores + total.
 *
 * **Dois modos, e a divisão é sobre quando se pode gravar.**
 *
 * - **Jogo** grava no toque. Marcar Stress no meio de um turno não pode pedir
 *   confirmação, e o que se marca ali é estado de mesa: some no descanso.
 * - **Edição** não grava nada sem Salvar. Nome, nível, classe e traço *definem*
 *   os máximos e viajam para a mesa inteira; um deles reescrito por engano, e
 *   gravado sozinho, é um estrago que ninguém vê acontecer.
 *
 * O rascunho vive aqui e não no painel: sair da edição com alteração pendente
 * precisa ser barrado, e quem sabe que há pendência é quem guarda o rascunho.
 */
export const Sheet = () => {
  const { sheetId } = useParams<{ sheetId: string }>()
  const [roster, setRoster] = useAtom(rosterAtom)
  const houseRules = useAtomValue(houseRulesAtom)
  const sheetRoles = useAtomValue(sheetRolesAtom)

  const [tab, setTab] = React.useState<SheetTabId>("combate")
  const [mode, setMode] = React.useState<SheetMode>("play")
  const [draft, setDraft] = React.useState<Character | null>(null)
  const [isConfirmingDiscard, setIsConfirmingDiscard] = React.useState(false)

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

  // O modo edição calcula sobre o rascunho: é o que faz Evasion e HP mudarem
  // enquanto se escolhe a classe, antes de confirmar.
  const shown = draft ?? character
  const derived = derive(shown, houseRules)
  const isDirty = draft !== null && hasSheetEdits(draft, character)

  const enterEdit = () => {
    setDraft(character)
    setMode("edit")
  }

  const leaveEdit = () => {
    setDraft(null)
    setMode("play")
  }

  const requestPlayMode = () => {
    if (isDirty) {
      setIsConfirmingDiscard(true)

      return
    }

    leaveEdit()
  }

  const handleSave = () => {
    if (draft) {
      commit(draft)
    }

    leaveEdit()
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

  const combatPanel = (
    <>
      <div className={styles.toolbar}>
        {/* `radiogroup` e não dois botões soltos: os modos são exclusivos, e é
            isso que faz o leitor anunciar "1 de 2". */}
        <div className={styles.modeToggle} role="radiogroup" aria-label="Modo da ficha">
          {(
            [
              ["play", "Jogo"],
              ["edit", "Edição"],
            ] as const
          ).map(([option, label]) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={mode === option}
              className={styles.modeOption}
              disabled={isReadOnly && option === "edit"}
              data-testid={`sheet-mode-${option}`}
              onClick={() => (option === "edit" ? enterEdit() : requestPlayMode())}
            >
              {label}
            </button>
          ))}
        </div>

        {isReadOnly ? (
          <p className={styles.note}>Você é leitor: dá para ver tudo, nada é salvo.</p>
        ) : (
          <SaveState className={styles.saveState} sheetId={character.id} />
        )}
      </div>

      <StepRule />

      {mode === "edit" && draft ? (
        <EditPanel
          draft={draft}
          derived={derived}
          isDirty={isDirty}
          onChange={(mutate) => setDraft((current) => (current ? mutate(current) : current))}
          onSave={handleSave}
          onDiscard={() => setIsConfirmingDiscard(true)}
        />
      ) : (
        <PlayPanel
          character={character}
          derived={derived}
          isReadOnly={isReadOnly}
          onMarksChange={handleMarksChange}
        />
      )}
    </>
  )

  return (
    <main className={styles.page}>
      {/*
        As abas não construídas entram desabilitadas em vez de abrirem um aviso:
        o aviso ocupa a tela inteira para dizer que não há nada, e uma aba
        apagada já diz isso sem que se precise clicar.
      */}
      <Tabs
        className={styles.tabs}
        hideArrows
        hideDots
        activeTabId={tab}
        onTabChange={(tabId) => setTab(tabId as SheetTabId)}
        tabs={SHEET_TABS.map((sheetTab) => ({
          id: sheetTab.id,
          label: sheetTab.label,
          disabled: sheetTab.id !== "combate",
          content: sheetTab.id === "combate" ? combatPanel : null,
        }))}
      />

      {/* `isPersistent` porque descartar é irreversível: sair clicando no fundo
          é exatamente o acidente a evitar. */}
      <Modal
        isOpen={isConfirmingDiscard}
        isPersistent
        title="Descartar as alterações?"
        onClose={() => setIsConfirmingDiscard(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsConfirmingDiscard(false)}>
              CONTINUAR EDITANDO
            </Button>
            <Button
              intent="danger"
              onClick={() => {
                setIsConfirmingDiscard(false)
                leaveEdit()
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
