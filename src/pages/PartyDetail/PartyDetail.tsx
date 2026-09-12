import { Avatar, Button, Modal, SectionLabel } from "@jposawa/ronin-ui"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import React from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"

import { CLASSES_BY_NAME } from "@/compendium"
import { StepRule } from "@/components"
import { PARTY_ROLES, ROUTES } from "@/constants"
import {
  canLeaveParty,
  canRemoveSheetFromParty,
  domainColorToken,
  isPartyOwner,
  mustHandOverParty,
  promotableMembers,
  successorCandidates,
  touchCharacter,
} from "@/helpers"
import {
  deleteParty,
  fetchParty,
  fetchPartyMembers,
  fetchPartySheets,
  fetchProfile,
  handOverParty,
  leaveParty,
  promoteToNarrator,
  setSheetParty,
} from "@/services"
import { authAtom, charactersAtom, rosterAtom, sheetRolesAtom, toastAtom } from "@/states"
import type { Character, Party, PartyMember, PartyMemberView } from "@/types"

import styles from "./PartyDetail.module.css"

const labelForRole = (roleId: string): string =>
  PARTY_ROLES.find((role) => role.id === roleId)?.label ?? roleId

/**
 * Um grupo: quem está nele, quais fichas estão nele, e o código do convite.
 *
 * As fichas da party são lidas **sob demanda** e nunca entram no roster local.
 * Se entrassem, a sincronização passaria a empurrar ficha de outra pessoa como
 * se fosse sua — e a regra de segurança recusaria, em silêncio, para sempre.
 */
export const PartyDetail = () => {
  const { partyId } = useParams<{ partyId: string }>()
  const { user } = useAtomValue(authAtom)
  const [roster, setRoster] = useAtom(rosterAtom)
  const myCharacters = useAtomValue(charactersAtom)
  const sheetRoles = useAtomValue(sheetRolesAtom)
  const setToast = useSetAtom(toastAtom)
  const navigate = useNavigate()

  const [party, setParty] = React.useState<Party | null>(null)
  const [members, setMembers] = React.useState<PartyMemberView[]>([])
  const [sheets, setSheets] = React.useState<Character[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isConfirmingDelete, setIsConfirmingDelete] = React.useState(false)
  const [isHandingOver, setIsHandingOver] = React.useState(false)
  const [isWorking, setIsWorking] = React.useState(false)
  /** A ficha que está sendo tirada. A própria ficha, não um booleano: o modal
      precisa dizer qual é, e um `isConfirming` obrigaria um segundo estado só
      para lembrar disso. */
  const [sheetToRemove, setSheetToRemove] = React.useState<Character | null>(null)

  React.useEffect(() => {
    if (!partyId) {
      return
    }

    let isCancelled = false

    const load = async () => {
      try {
        const [loadedParty, loadedMembers, loadedSheets] = await Promise.all([
          fetchParty(partyId),
          fetchPartyMembers(partyId),
          fetchPartySheets(partyId),
        ])

        // O nome de cada membro vem do perfil; sem isso a lista mostraria uid.
        const views = await Promise.all(
          loadedMembers.map(async (member) => {
            const profile = await fetchProfile(member.userId).catch(() => null)

            return {
              member,
              displayName: profile?.displayName ?? "Jogador",
              photoUrl: profile?.photoUrl ?? null,
            }
          }),
        )

        if (!isCancelled) {
          setParty(loadedParty)
          setMembers(views)
          setSheets(loadedSheets)
        }
      } catch {
        if (!isCancelled) {
          setToast("Não foi possível carregar o grupo.")
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      isCancelled = true
    }
  }, [partyId, setToast])

  if (!partyId || !user) {
    return <Navigate to={ROUTES.parties} replace />
  }

  const memberRows = members.map((view) => view.member)
  const myRole = memberRows.find((member) => member.userId === user.userId)

  /**
   * As três perguntas vêm de `helpers/party.ts`, que é onde a regra mora e onde
   * ela é testada — a mesma que a `database.rules.json` impõe. Reescrevê-las
   * aqui seria a versão da tela discordando da do servidor no dia em que uma
   * das duas mudasse.
   */
  const canLeave = canLeaveParty(memberRows, user.userId)
  const isOwner = isPartyOwner(party, user.userId)
  const needsHandOver = mustHandOverParty(party, memberRows, user.userId)
  const isLastNarrator = Boolean(myRole) && !canLeave
  const promotable = promotableMembers(memberRows)
  const successors = successorCandidates(memberRows, user.userId)

  const nameOf = (userId: string): string =>
    members.find((view) => view.member.userId === userId)?.displayName ?? "Jogador"

  const sheetsInParty = new Set(sheets.map((sheet) => sheet.id))
  const addableSheets = myCharacters.filter((character) => !sheetsInParty.has(character.id))

  const handleAddSheet = async (character: Character) => {
    try {
      await setSheetParty(character.id, partyId, character.partyId)

      // O campo local acompanha: é ele que a ficha mostra, e a sincronização
      // já vai empurrar a mudança junto com o resto.
      setRoster({
        ...roster,
        characters: {
          ...roster.characters,
          [character.id]: touchCharacter({ ...character, partyId }),
        },
      })
      setSheets((current) => [...current, { ...character, partyId }])
      setToast("Ficha adicionada ao grupo")
    } catch {
      setToast("Não foi possível adicionar a ficha.")
    }
  }

  const handleRemoveSheet = async (sheet: Character) => {
    setIsWorking(true)

    try {
      await setSheetParty(sheet.id, null, partyId)

      // A ficha não é apagada — só perde o vínculo. Se ela for sua, o roster
      // local acompanha; se for de outra pessoa, não há o que atualizar aqui,
      // porque ficha de terceiro nunca entra no roster local.
      const mine = roster.characters[sheet.id]

      if (mine) {
        setRoster({
          ...roster,
          characters: {
            ...roster.characters,
            [sheet.id]: touchCharacter({ ...mine, partyId: null }),
          },
        })
      }

      setSheets((current) => current.filter((entry) => entry.id !== sheet.id))
      setToast("Ficha tirada do grupo")
    } catch {
      setToast("Não foi possível tirar a ficha.")
    } finally {
      setIsWorking(false)
      setSheetToRemove(null)
    }
  }

  const handleLeave = async () => {
    // O Dono não sai direto: primeiro decide para quem o grupo fica.
    if (needsHandOver) {
      setIsHandingOver(true)

      return
    }

    setIsWorking(true)

    try {
      await leaveParty(partyId, user.userId)
      setToast("Você saiu do grupo")
      void navigate(ROUTES.parties)
    } catch {
      setToast("Não foi possível sair do grupo.")
    } finally {
      setIsWorking(false)
    }
  }

  const handlePromote = async (member: PartyMember) => {
    setIsWorking(true)

    try {
      const promoted = await promoteToNarrator(member)
      setToast(`${nameOf(member.userId)} agora é Narrador`)
      // Recarregar seria ir ao servidor perguntar o que acabamos de mandar: a
      // promoção é determinística e já foi confirmada.
      setMembers((current) =>
        current.map((view) =>
          view.member.userId === member.userId ? { ...view, member: promoted } : view,
        ),
      )
    } catch {
      setToast("Não foi possível promover.")
    } finally {
      setIsWorking(false)
    }
  }

  const handleHandOver = async (toUserId: string) => {
    setIsWorking(true)

    try {
      await handOverParty(partyId, user.userId, toUserId)
      setToast(`O grupo agora é de ${nameOf(toUserId)}`)
      void navigate(ROUTES.parties)
    } catch {
      setToast("Não foi possível entregar o grupo.")
    } finally {
      setIsWorking(false)
      setIsHandingOver(false)
    }
  }

  const handleDelete = async () => {
    setIsWorking(true)

    try {
      await deleteParty(
        partyId,
        members.map((view) => view.member.userId),
        sheets.map((sheet) => sheet.id),
      )

      // As fichas continuam existindo, então o roster local precisa perder o
      // vínculo junto — senão a ficha mostraria um grupo que não existe mais.
      const released = Object.fromEntries(
        Object.entries(roster.characters).map(([id, character]) => [
          id,
          character.partyId === partyId ? touchCharacter({ ...character, partyId: null }) : character,
        ]),
      )

      setRoster({ ...roster, characters: released })
      setToast("Grupo apagado")
      void navigate(ROUTES.parties)
    } catch {
      setToast("Não foi possível apagar o grupo.")
    } finally {
      setIsWorking(false)
      setIsConfirmingDelete(false)
    }
  }

  return (
    <main className={styles.page}>
      <StepRule />

      <h2 className={styles.title}>{party?.name ?? (isLoading ? "Carregando…" : "Grupo")}</h2>

      <SectionLabel detail={String(members.length)}>MEMBROS</SectionLabel>
      <ul className={styles.list}>
        {members.map(({ member, displayName, photoUrl }) => (
          <li className={styles.row} key={member.userId}>
            <Avatar imageUrl={photoUrl ?? undefined} name={displayName} />
            <span className={styles.rowText}>
              <b className={styles.rowName}>{displayName}</b>
              <span className={styles.rowMeta}>
                {labelForRole(member.roleId)}
                {isPartyOwner(party, member.userId) ? " · dono" : ""}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <SectionLabel detail={String(sheets.length)}>FICHAS DO GRUPO</SectionLabel>
      {sheets.length === 0 ? (
        <p className={styles.empty}>Nenhuma ficha no grupo ainda.</p>
      ) : (
        <ul className={styles.list}>
          {sheets.map((sheet) => {
            const classDefinition = sheet.className
              ? CLASSES_BY_NAME.get(sheet.className)
              : undefined

            return (
              <li
                className={styles.row}
                key={sheet.id}
                style={
                  {
                    "--domain-color": classDefinition
                      ? domainColorToken(classDefinition.domains[0])
                      : undefined,
                  } as React.CSSProperties
                }
              >
                <span className={styles.level}>{sheet.level}</span>
                <span className={styles.rowText}>
                  <b className={styles.rowName}>{sheet.name || "Sem nome"}</b>
                  <span className={styles.rowMeta}>
                    {[sheet.ancestry, sheet.className].filter(Boolean).join(" · ") ||
                      "ficha em branco"}
                  </span>
                </span>

                {/* A porta de saída na própria linha, ao lado da ficha que ela
                    tira. Pôr uma ficha era um botão e tirá-la não era nada —
                    quem entrasse com a ficha errada ficava sem caminho de
                    volta a não ser desfazer a mesa. */}
                {canRemoveSheetFromParty(sheetRoles[sheet.id], memberRows, user.userId) ? (
                  <Button
                    variant="text"
                    intent="danger"
                    disabled={isWorking}
                    aria-label={`Tirar ${sheet.name || "ficha sem nome"} do grupo`}
                    onClick={() => setSheetToRemove(sheet)}
                  >
                    TIRAR
                  </Button>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}

      {addableSheets.length > 0 ? (
        <>
          <SectionLabel>PÔR UMA FICHA SUA NO GRUPO</SectionLabel>
          <div className={styles.actions}>
            {addableSheets.map((character) => (
              <Button
                key={character.id}
                isFullWidth
                variant="outline"
                onClick={() => void handleAddSheet(character)}
              >
                + &nbsp;{character.name || "Sem nome"}
              </Button>
            ))}
          </div>
        </>
      ) : null}

      <SectionLabel>CÓDIGO DO GRUPO</SectionLabel>
      <p className={styles.code}>{partyId}</p>
      <p className={styles.note}>
        Quem tem este código entra no grupo e passa a ver as fichas dele. Ele não
        expira e não dá para revogar — trate como o link de uma ficha.
      </p>

      {/* Promover é ação de Narrador, e não só a saída de emergência de quem
          está preso: uma mesa grande quer um segundo Narrador de qualquer
          jeito. Por isso a seção não depende de `isLastNarrator`. */}
      {myRole?.roleId === "gm" && promotable.length > 0 ? (
        <>
          <SectionLabel>ADICIONAR NARRADOR</SectionLabel>
          <div className={styles.actions}>
            {promotable.map((member) => (
              <Button
                key={member.userId}
                isFullWidth
                variant="outline"
                disabled={isWorking}
                onClick={() => void handlePromote(member)}
              >
                + &nbsp;{nameOf(member.userId).toUpperCase()}
              </Button>
            ))}
          </div>
          <p className={styles.note}>
            Narrador administra o grupo junto com você — ninguém é rebaixado. É
            também o que libera a sua saída, se você for o único hoje.
          </p>
        </>
      ) : null}

      <div className={styles.actions}>
        <Button
          isFullWidth
          variant="outline"
          intent="danger"
          disabled={!myRole || !canLeave || isWorking}
          onClick={() => void handleLeave()}
        >
          SAIR DO GRUPO
        </Button>
      </div>

      {isLastNarrator ? (
        <p className={styles.note}>
          {promotable.length > 0
            ? "Você é o único Narrador, então sair deixaria a mesa sem quem a administre — um grupo sem Narrador não pode ser apagado nem ter alguém promovido. Suba alguém a Narrador acima, ou desfaça a mesa."
            : "Você é o único Narrador e não há mais ninguém na mesa. Sair deixaria o grupo inalcançável, então o que resta é desfazê-lo."}
        </p>
      ) : null}

      {isOwner && !isLastNarrator ? (
        <p className={styles.note}>
          O grupo é seu. Ao sair, você escolhe para qual Narrador ele fica.
        </p>
      ) : null}

      {/* Apagar é do Dono, não de todo Narrador: o grupo é dele, e um Narrador
          convidado que quiser sair sempre pode — o Dono continua na mesa como
          segundo Narrador, então `canLeaveParty` já o libera. Ninguém fica
          preso precisando desta porta. */}
      {isOwner && myRole?.roleId === "gm" ? (
        <>
          <SectionLabel>DESFAZER A MESA</SectionLabel>
          <div className={styles.actions}>
            <Button
              isFullWidth
              intent="danger"
              disabled={isWorking}
              onClick={() => setIsConfirmingDelete(true)}
            >
              APAGAR GRUPO
            </Button>
          </div>
        </>
      ) : null}

      {/* Tirar ficha passa por confirmação porque mexe no que a mesa inteira
          vê, e porque pôr de volta uma ficha que não é sua depende do dono
          dela estar por perto. `isPersistent` pelo mesmo motivo do apagar. */}
      <Modal
        isOpen={sheetToRemove !== null}
        isPersistent
        title="Tirar esta ficha do grupo?"
        onClose={() => setSheetToRemove(null)}
        footer={
          <>
            <Button
              variant="outline"
              disabled={isWorking}
              onClick={() => setSheetToRemove(null)}
            >
              CANCELAR
            </Button>
            <Button
              intent="danger"
              disabled={isWorking}
              onClick={() => sheetToRemove && void handleRemoveSheet(sheetToRemove)}
            >
              {isWorking ? "TIRANDO…" : "TIRAR"}
            </Button>
          </>
        }
      >
        <p className={styles.note}>
          <b>{sheetToRemove?.name || "Sem nome"}</b> sai da mesa e deixa de aparecer
          para os outros membros. <b>A ficha não é apagada</b> — ela volta para quem a
          escreveu, sem grupo, e pode entrar de novo depois.
        </p>
      </Modal>

      {/* Entregar o grupo: só aparece quando o Dono tenta sair, porque é aí que
          a escolha existe. `isPersistent` porque sair pelo fundo deixaria a
          pessoa achando que saiu — e ela continua dentro. */}
      <Modal
        isOpen={isHandingOver}
        isPersistent
        title="Para quem fica o grupo?"
        onClose={() => setIsHandingOver(false)}
        footer={
          <Button
            variant="outline"
            disabled={isWorking}
            onClick={() => setIsHandingOver(false)}
          >
            CANCELAR
          </Button>
        }
      >
        {successors.length > 0 ? (
          <>
            <p className={styles.note}>
              O grupo <b>{party?.name || "Sem nome"}</b> é seu. Escolha quem passa a
              ser o Dono — você sai na mesma ação.
            </p>
            <div className={styles.actions}>
              {successors.map((member) => (
                <Button
                  key={member.userId}
                  isFullWidth
                  variant="outline"
                  disabled={isWorking}
                  onClick={() => void handleHandOver(member.userId)}
                >
                  {nameOf(member.userId).toUpperCase()}
                </Button>
              ))}
            </div>
          </>
        ) : (
          <p className={styles.note}>
            O grupo só pode ficar com outro Narrador, e ainda não há nenhum além de
            você. Feche isto e suba alguém a Narrador — ou desfaça a mesa, se ela
            acabou.
          </p>
        )}
      </Modal>

      {/* Modal da ronin-ui: <dialog> nativo, então prender o foco, fechar no
          Escape e devolver o foco ao gatilho vêm do navegador. `isPersistent`
          porque apagar é irreversível — sair sem querer clicando no fundo é
          exatamente o acidente a evitar. */}
      <Modal
        isOpen={isConfirmingDelete}
        isPersistent
        title="Apagar este grupo?"
        onClose={() => setIsConfirmingDelete(false)}
        footer={
          <>
            <Button
              variant="outline"
              disabled={isWorking}
              onClick={() => setIsConfirmingDelete(false)}
            >
              CANCELAR
            </Button>
            <Button intent="danger" disabled={isWorking} onClick={() => void handleDelete()}>
              {isWorking ? "APAGANDO…" : "APAGAR"}
            </Button>
          </>
        }
      >
        <p className={styles.note}>
          O grupo <b>{party?.name || "Sem nome"}</b> some para todos os{" "}
          {members.length === 1 ? "seus membros" : `${members.length} membros`}, junto
          com o código de convite. Não dá para desfazer.
        </p>
        <p className={styles.note}>
          As {sheets.length === 1 ? "ficha" : "fichas"} do grupo{" "}
          <b>não {sheets.length === 1 ? "é apagada" : "são apagadas"}</b> — cada uma
          volta para quem a escreveu, sem grupo.
        </p>
      </Modal>
    </main>
  )
}
