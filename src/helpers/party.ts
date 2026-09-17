import { SHEET_ROLE_LEVEL } from "@/constants"
import type { Party, PartyMember, SheetRoleId } from "@/types"

/**
 * O que cada pessoa pode fazer com o grupo em que está.
 *
 * Isto é regra de domínio, não de tela: são as mesmas condições que a
 * `database.rules.json` impõe, e a tela apenas as reflete. Fora de um
 * componente porque a resposta não depende de nada renderizado, e porque
 * "quando é que o grupo fica órfão?" é a pergunta que precisa de teste.
 *
 * **Papel e posse são coisas diferentes**, e é essa separação que organiza o
 * arquivo:
 *
 * - **Narrador** é papel (`roleId: 'gm'`), e pode haver vários. Administra o
 *   grupo: promove, apaga, põe ficha.
 * - **Dono** é posse (`party.createdBy`), e é exatamente um. É de quem o grupo
 *   *é* — e por isso ele não some sem passar a alguém.
 *
 * Juntar os dois num papel só foi a tentação anterior, e ela obrigava a
 * rebaixar o Narrador atual para promover outro. Separando, promover deixa de
 * tirar nada de ninguém.
 */

export const partyNarrators = (
  members: readonly PartyMember[],
): readonly PartyMember[] => members.filter((member) => member.roleId === "gm")

export const isPartyNarrator = (
  members: readonly PartyMember[],
  userId: string,
): boolean => partyNarrators(members).some((member) => member.userId === userId)

export const isPartyOwner = (party: Party | null, userId: string): boolean =>
  party?.createdBy === userId

/**
 * **Um Narrador sozinho não sai — e é isto que impede o grupo órfão.**
 *
 * Grupo sem Narrador não pode ser apagado, renomeado, nem ter alguém promovido:
 * nenhuma dessas operações teria quem a autorizasse. As fichas ficariam presas
 * a uma mesa que não responde mais, e o nó vazio ainda abriria a porta para um
 * estranho se declarar Narrador dele.
 *
 * A saída é promover outro antes — daí "adicionar Narrador", e não "passar o
 * mestrado". Quem não é Narrador sai sempre: a mesa continua administrada.
 */
export const canLeaveParty = (
  members: readonly PartyMember[],
  userId: string,
): boolean => {
  if (!members.some((member) => member.userId === userId)) {
    return false
  }

  if (!isPartyNarrator(members, userId)) {
    return true
  }

  return partyNarrators(members).length > 1
}

/** Quem ainda não é Narrador e pode ser promovido. */
export const promotableMembers = (
  members: readonly PartyMember[],
): readonly PartyMember[] => members.filter((member) => member.roleId !== "gm")

/**
 * Para quem a **posse** pode ir: outro Narrador.
 *
 * Só Narrador, porque o Dono administra o grupo — entregá-lo a um jogador
 * criaria dono sem poder sobre a própria mesa. Quando não há candidato, o
 * caminho é promover alguém primeiro, ou desfazer o grupo.
 */
export const successorCandidates = (
  members: readonly PartyMember[],
  userId: string,
): readonly PartyMember[] =>
  partyNarrators(members).filter((member) => member.userId !== userId)

/**
 * O Dono precisa entregar o grupo antes de sair?
 *
 * Sim sempre que sobrar alguém na mesa. Dono sozinho não tem a quem entregar, e
 * a única saída honesta ali é apagar o grupo — ficha presa a uma mesa sem
 * ninguém é pior que mesa nenhuma.
 */
export const mustHandOverParty = (
  party: Party | null,
  members: readonly PartyMember[],
  userId: string,
): boolean =>
  isPartyOwner(party, userId) && members.some((member) => member.userId !== userId)

/**
 * Quem pode tirar uma ficha do grupo.
 *
 * As mesmas duas portas da `database.rules.json` em `partySheets/$partyId/
 * $sheetId`: nível ≥ 20 no acesso à ficha (autor ou co-autor — é a ficha de
 * quem está pedindo), **ou** nível ≥ 20 na mesa (Narrador). Um jogador não
 * tira a ficha de outro, e o Narrador tira qualquer uma — é ele quem responde
 * por quem está na mesa.
 *
 * Reescrever a condição na tela seria a versão do cliente discordando da do
 * servidor no dia em que uma das duas mudasse; por isso mora aqui, com teste.
 */
export const canRemoveSheetFromParty = (
  sheetRoleId: SheetRoleId | undefined,
  members: readonly PartyMember[],
  userId: string,
): boolean => {
  const hasSheetWrite =
    sheetRoleId !== undefined && SHEET_ROLE_LEVEL[sheetRoleId] >= SHEET_ROLE_LEVEL.coAuthor

  return hasSheetWrite || isPartyNarrator(members, userId)
}
