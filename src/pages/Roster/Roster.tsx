import { Button, Modal, SectionLabel } from "@jposawa/ronin-ui"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import React from "react"
import { Link } from "react-router-dom"

import { Icon, StepRule } from "@/components"
import { ROUTES } from "@/constants"
import {
  createCharacter,
  domainColorToken,
  duplicateCharacter,
  heritageLabel,
  toImageUrl,
} from "@/helpers"
import { useCompendium } from "@/hooks"
import { deleteSheet, leaveSheet } from "@/services"
import {
  authAtom,
  charactersAtom,
  houseRulesAtom,
  rosterAtom,
  sheetRolesAtom,
  toastAtom,
} from "@/states"
import type { Character } from "@/types"

import styles from "./Roster.module.css"

const summaryOf = (character: Character): string =>
  [heritageLabel(character), character.className, character.subclass]
    .filter(Boolean)
    .join(" · ") || "ficha em branco"

/**
 * Rota raiz, atrás do login. O roster abre primeiro, não a ficha: a maioria
 * tem mais de um personagem, e abrir na última editada é a decisão errada
 * quando não é a que você quer. dh-sw-arquitetura.md §7.
 */
export const Roster = () => {
  const { compendium } = useCompendium()

  const characters = useAtomValue(charactersAtom)
  const [roster, setRoster] = useAtom(rosterAtom)
  const { user } = useAtomValue(authAtom)
  const houseRulesTemplate = useAtomValue(houseRulesAtom)
  const [sheetRoles, setSheetRoles] = useAtom(sheetRolesAtom)
  const setToast = useSetAtom(toastAtom)

  /**
   * A ficha que está para sair, e não um booleano: o aviso precisa dizer
   * **qual** é, e um `isConfirming` obrigaria um segundo estado só para
   * lembrar disso.
   */
  const [toRemove, setToRemove] = React.useState<Character | null>(null)

  const addLocally = (character: Character) => {
    setRoster({
      characters: { ...roster.characters, [character.id]: character },
      order: [character.id, ...roster.order],
    })
    // A escrita remota é do `useSheetSync`: ficha que o servidor nunca viu
    // entra por `createSheet`, que é quem cria a linha de acesso junto.
    setSheetRoles({ ...sheetRoles, [character.id]: "author" })
  }

  /** O papel decide o texto do aviso e o que o botão faz. */
  const isAuthorOf = (character: Character | null): boolean => {
    const role = character ? sheetRoles[character.id] : undefined

    return role === undefined || role === "author"
  }

  const handleCreate = () => {
    addLocally(createCharacter("", houseRulesTemplate))
  }

  const handleDuplicate = (source: Character) => {
    addLocally(duplicateCharacter(source))
    setToast("Ficha duplicada")
  }

  /**
   * Remover ramifica pelo papel, e a diferença é grande: o autor apaga a
   * ficha para todo mundo; quem só tem acesso sai dela e o dono nem fica
   * sabendo. Apagar só do local traria a ficha de volta no próximo login.
   */
  const handleRemove = (character: Character) => {
    setToRemove(null)

    const role = sheetRoles[character.id]
    const isAuthor = role === undefined || role === "author"

    const remaining = { ...roster.characters }
    delete remaining[character.id]

    const remainingRoles = { ...sheetRoles }
    delete remainingRoles[character.id]

    setRoster({
      characters: remaining,
      order: roster.order.filter((id) => id !== character.id),
    })
    setSheetRoles(remainingRoles)

    if (user) {
      const remove = isAuthor
        ? deleteSheet(character.id)
        : leaveSheet(character.id, user.userId)

      void remove.catch(() => setToast("Removida daqui, mas falhou no servidor."))
    }

    setToast(isAuthor ? "Ficha apagada" : "Você saiu da ficha")
  }

  return (
    <main className={styles.page}>
      <StepRule />
      <SectionLabel>
        {characters.length} {characters.length === 1 ? "ficha" : "fichas"}
      </SectionLabel>

      {characters.length === 0 ? (
        <p className={styles.empty}>Nenhuma ficha ainda.</p>
      ) : (
        <ul className={styles.list}>
          {characters.map((character) => {
            const classDefinition = character.className
              ? compendium.classes.find((candidate) => candidate.name === character.className)
              : undefined
            const color = classDefinition
              ? domainColorToken(classDefinition.domains[0])
              : undefined
            const role = sheetRoles[character.id]
            const isAuthor = role === undefined || role === "author"

            return (
              <li
                className={styles.card}
                key={character.id}
                style={{ "--domain-color": color } as React.CSSProperties}
              >
                <Link className={styles.open} to={ROUTES.sheet(character.id)}>
                  {/* A linha continua a mesma sem imagem: o retrato entra
                      antes do nível, e a ficha sem ele não abre buraco. */}
                  {toImageUrl(character.avatarUrl ?? "") ? (
                    <img
                      className={styles.portrait}
                      src={toImageUrl(character.avatarUrl ?? "") ?? ""}
                      alt=""
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.hidden = true
                      }}
                    />
                  ) : null}

                  <span className={styles.level}>{character.level}</span>
                  <span className={styles.nameBlock}>
                    <b className={styles.name}>{character.name || "Sem nome"}</b>
                    <span className={styles.summary}>{summaryOf(character)}</span>
                  </span>
                </Link>
                <Button
                  variant="outline"
                  className={styles.action}
                  aria-label={`Duplicar ${character.name || "ficha sem nome"}`}
                  onClick={() => handleDuplicate(character)}
                >
                  <Icon name="copy" />
                </Button>
                {/* Lixeira e não ×: um × lê como "fechar", e o que ele faz é
                    apagar a ficha para todo mundo. Desenhada, e não o emoji —
                    emoji colorido ignora `color` e a lixeira nunca ficava
                    vermelha, que é a única coisa que ela precisava fazer. */}
                <Button
                  variant="outline"
                  intent={isAuthor ? "danger" : "neutral"}
                  className={styles.action}
                  aria-label={
                    isAuthor
                      ? `Apagar ${character.name || "ficha sem nome"}`
                      : `Sair de ${character.name || "ficha sem nome"}`
                  }
                  onClick={() => setToRemove(character)}
                >
                  {isAuthor ? <Icon name="trash" /> : "↪"}
                </Button>
              </li>
            )
          })}
        </ul>
      )}

      <Button isFullWidth className={styles.primary} onClick={handleCreate}>
        + &nbsp;NOVA FICHA
      </Button>

      {/*
        Apagar ficha não tem desfazer: some do aparelho e do servidor, para
        todo mundo que tinha acesso. É a única ação do app que destrói trabalho
        de sessões inteiras, e por isso pergunta — mesmo sendo dois toques.
      */}
      <Modal
        isOpen={toRemove !== null}
        isPersistent
        title={isAuthorOf(toRemove) ? "Apagar esta ficha?" : "Sair desta ficha?"}
        onClose={() => setToRemove(null)}
        footer={
          <>
            <Button variant="outline" onClick={() => setToRemove(null)}>
              CANCELAR
            </Button>
            <Button
              intent="danger"
              onClick={() => toRemove && handleRemove(toRemove)}
            >
              {isAuthorOf(toRemove) ? "APAGAR" : "SAIR"}
            </Button>
          </>
        }
      >
        <p className={styles.confirmText}>
          {isAuthorOf(toRemove)
            ? `"${toRemove?.name || "Sem nome"}" some deste aparelho e do servidor, para todo mundo que tinha acesso. Não dá para desfazer.`
            : `Você perde o acesso a "${toRemove?.name || "Sem nome"}". A ficha continua com quem a criou, e essa pessoa não fica sabendo.`}
        </p>
      </Modal>
    </main>
  )
}
