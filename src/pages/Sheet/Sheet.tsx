import { Button, Modal, Tabs } from "@jposawa/ronin-ui"
import { LuDices } from "react-icons/lu"
import { useAtom, useSetAtom } from "jotai"
import React from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"

import { ROUTES, RULE_ERROR_MESSAGES, SHEET_TABS } from "@/constants"
import { SaveState } from "@/fragments"
import { duplicateCharacter, hasSheetEdits, touchCharacter } from "@/helpers"
import { HouseRulesContext, usePartyHouseRules, useSheet } from "@/hooks"
import { rosterAtom, sheetRolesAtom, toastAtom } from "@/states"
import type { Character, DicePreset, Marks, Result, SheetTabId } from "@/types"

import {
  CardsPanel,
  CombatEdit,
  CombatPlay,
  HistoryPanel,
  InventoryPanel,
  RollDrawer,
  RulesPanel,
} from "./SheetPanels"

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
  const [sheetRoles, setSheetRoles] = useAtom(sheetRolesAtom)
  const setToast = useSetAtom(toastAtom)
  const navigate = useNavigate()

  const [tab, setTab] = React.useState<SheetTabId>("combate")
  const [draft, setDraft] = React.useState<Character | null>(null)
  const [isConfirmingCancel, setIsConfirmingCancel] = React.useState(false)
  const [isConfirmingCopy, setIsConfirmingCopy] = React.useState(false)

  /**
   * O rolador é da ficha, não de uma aba dela.
   *
   * Ele morava em Combate, e rolar estando em Cartas ou no Inventário pedia
   * uma volta pela aba de mesa. Aqui o botão acompanha a ficha inteira, e o
   * toque num atributo ou numa arma continua entrando por `onPrepareRoll`.
   *
   * `undefined` é gaveta fechada; `null`, aberta para rolagem solta.
   */
  const [rollPreset, setRollPreset] = React.useState<DicePreset | null | undefined>(undefined)

  /**
   * Editando, tudo se calcula sobre o rascunho: é o que faz Evasion e HP
   * mudarem enquanto se escolhe a classe, antes de confirmar. É por isso que
   * o rascunho entra no hook em vez de a tela derivar por fora.
   */
  const { character, isReadOnly, houseRules, derived } = useSheet(sheetId, draft)
  // A aba de Regras mostra as da mesa ao lado das da ficha, então precisa das
  // duas separadas — `houseRules` já traz só a que vale.
  const partyRules = usePartyHouseRules(character?.partyId ?? null)

  /**
   * Uma cópia da ficha, e abre nela.
   *
   * Copiar é para variar sobre o que já existe — outro build da mesma ideia,
   * o mesmo personagem noutra mesa —, e quem copia quer mexer na cópia. Ficar
   * na original obrigaria a procurá-la na lista para chegar onde já se queria.
   *
   * Vale também para quem só lê a ficha: a cópia é sua, não dela.
   */
  const handleCopy = (source: Character) => {
    const copy = duplicateCharacter(source)

    setRoster({
      characters: { ...roster.characters, [copy.id]: copy },
      order: [copy.id, ...roster.order],
    })
    // A escrita remota é do `useSheetSync`, como em toda ficha nascida aqui.
    setSheetRoles({ ...sheetRoles, [copy.id]: "author" })
    setToast("Cópia criada")
    navigate(ROUTES.sheet(copy.id))
  }

  const commit = (next: Character) => {
    setRoster({
      ...roster,
      characters: { ...roster.characters, [next.id]: touchCharacter(next) },
    })
  }

  if (!character || !derived) {
    return <Navigate to={ROUTES.roster} replace />
  }

  const isEditing = draft !== null
  const shown = draft ?? character
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
        <CombatEdit
          draft={draft}
          derived={derived}
          houseRules={houseRules}
          onChange={changeDraft}
          onApply={applyResult}
        />
      ) : (
        <CombatPlay
          character={character}
          derived={derived}
          isReadOnly={isReadOnly}
          onMarksChange={handleMarksChange}
          onApply={applyResult}
          onPrepareRoll={setRollPreset}
        />
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
      return <InventoryPanel character={shown} derived={derived} onApply={applyResult} />
    }

    if (tabId === "regras") {
      return (
        <RulesPanel
          character={shown}
          partyRules={partyRules}
          isEditing={isEditing}
          onChange={changeDraft}
        />
      )
    }

    return (
      <HistoryPanel character={shown} isEditing={isEditing} onChange={changeDraft} />
    )
  }

  return (
    <HouseRulesContext.Provider value={houseRules}>
      <main className={styles.page}>
        <header className={styles.toolbar}>
          <div className={styles.status}>
            {/* Rolar é o gesto mais repetido da mesa, e não é de uma aba: aqui
                ele acompanha a ficha inteira, inclusive enquanto se edita. */}
            <Button
              className={styles.rollButton}
              variant="outline"
              onClick={() => setRollPreset(null)}
            >
              <LuDices aria-hidden="true" />
              ROLAR
            </Button>

            {/* Ao lado do botão, e só enquanto tem o que dizer: parado, o
                estado de gravação é um tique que ninguém lê. */}
            {!isReadOnly && <SaveState className={styles.saveState} sheetId={character.id} />}
          </div>

          {/* Um botão, e não um alternador de dois estados: editar é uma coisa
            que se faz e se termina — com o resultado salvo ou cancelado —,
            não um lugar em que se fica. */}
          {isEditing ? null : (
            <menu className={styles.toolbarActions}>
              {/* Copiar some enquanto se edita: ele copia o que está salvo, e
                  ao lado de um rascunho em aberto isso lê como se copiasse o
                  que está na tela. */}
              <Button
                className={styles.copyButton}
                variant="text"
                onClick={() => setIsConfirmingCopy(true)}
              >
                COPIAR FICHA
              </Button>

              <Button
                className={styles.editButton}
                variant="text"
                disabled={isReadOnly}
                onClick={() => setDraft(character)}
              >
                EDITAR FICHA
              </Button>
            </menu>
          )}
        </header>

        {/* Fora da faixa grudada: ela tem altura fixa, e este aviso é de duas
            linhas no celular. */}
        {isReadOnly && (
          <p className={styles.note}>Você é leitor: dá para ver tudo, nada é salvo.</p>
        )}

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
        {isEditing && (
          <footer className={styles.saveBar}>
            <p className={styles.saveHint}>{isDirty ? "Alterações não salvas" : "Nada alterado"}</p>
            <Button variant="outline" onClick={requestCancel}>
              CANCELAR
            </Button>
            <Button disabled={!isDirty} onClick={handleSave}>
              SALVAR
            </Button>
          </footer>
        )}

        <RollDrawer
          isOpen={rollPreset !== undefined}
          character={shown}
          preset={rollPreset ?? null}
          onClose={() => setRollPreset(undefined)}
        />

        {/* `isPersistent` porque cancelar é irreversível: sair clicando no fundo
          é exatamente o acidente a evitar. */}
      {/*
        Copiar não destrói nada, mas leva embora: o botão está encostado no de
        editar, na mesma cara, e o toque errado tirava a pessoa da ficha em que
        estava e a punha noutra, com uma cópia a mais no roster para limpar.
      */}
      <Modal
        isOpen={isConfirmingCopy}
        title="Copiar esta ficha?"
        onClose={() => setIsConfirmingCopy(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsConfirmingCopy(false)}>
              CANCELAR
            </Button>
            <Button
              onClick={() => {
                setIsConfirmingCopy(false)
                handleCopy(character)
              }}
            >
              COPIAR
            </Button>
          </>
        }
      >
        <p className={styles.note}>
          Uma cópia de "{character.name || "Sem nome"}" entra no seu roster, e esta tela passa a
          mostrar a cópia. A ficha original fica como está.
        </p>
      </Modal>

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
            O que você mudou nesta ficha ainda não foi salvo. Descartando, ela volta ao que estava.
          </p>
        </Modal>
      </main>
    </HouseRulesContext.Provider>
  )
}
