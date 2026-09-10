import { get, update } from "firebase/database"

import { DB_PATHS, PARTY_ROLE_LEVEL } from "@/constants"
import { dhswPath, dhswRef, dhswRootRef } from "@/lib/firebase"
import type {
  Character,
  Party,
  PartyIndexEntry,
  PartyMember,
  PartyRoleId,
  PartyWithRole,
} from "@/types"

/**
 * Grupos de jogo.
 *
 * **Pertencer à party dá acesso às fichas dela pela regra de segurança, não
 * por linhas de `sheetAccess` materializadas.** Eu havia recomendado o
 * contrário; ao escrever, a materialização não fecha: para criar a linha de
 * acesso de outra pessoa numa ficha é preciso ser autor **daquela** ficha, e
 * quem entra na party depois não é autor de nada. O convidado entraria e não
 * veria nada do que já estava lá.
 *
 * Com a regra olhando `partyMembers`, membro novo enxerga o acervo inteiro na
 * hora e não há N escritas para manter em sincronia. O custo são duas leituras
 * a mais por avaliação de regra. Ver `database.rules.json`.
 */

const sanitize = <TValue>(value: TValue): TValue => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item)) as TValue
  }

  if (value === null || typeof value !== "object") {
    return value
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, fieldValue]) => fieldValue !== undefined)
      .map(([key, fieldValue]) => [key, sanitize(fieldValue)]),
  ) as TValue
}

const memberRow = (
  partyId: string,
  userId: string,
  roleId: PartyRoleId,
): PartyMember => ({
  partyId,
  userId,
  roleId,
  level: PARTY_ROLE_LEVEL[roleId],
  joinedAt: Date.now(),
})

const indexEntry = (member: PartyMember): PartyIndexEntry => ({
  roleId: member.roleId,
  level: member.level,
  joinedAt: member.joinedAt,
})

/**
 * Criar a party e a associação de quem criou é UMA operação.
 *
 * Party sem membro é inalcançável — mesma armadilha da ficha sem linha de
 * acesso. Quem cria entra como `gm`.
 */
export const createParty = async (name: string, userId: string): Promise<Party> => {
  const now = Date.now()
  const party: Party = {
    id: crypto.randomUUID(),
    name,
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
    notes: "",
  }

  const member = memberRow(party.id, userId, "gm")

  await update(dhswRootRef(), {
    [dhswPath(DB_PATHS.party(party.id))]: sanitize(party),
    [dhswPath(DB_PATHS.partyMember(party.id, userId))]: sanitize(member),
    [dhswPath(DB_PATHS.userParty(userId, party.id))]: indexEntry(member),
  })

  return party
}

export const fetchParty = async (partyId: string): Promise<Party | null> => {
  const snapshot = await get(dhswRef(DB_PATHS.party(partyId)))

  return snapshot.exists() ? (snapshot.val() as Party) : null
}

export const fetchPartiesForUser = async (userId: string): Promise<PartyWithRole[]> => {
  const indexSnapshot = await get(dhswRef(DB_PATHS.userParties(userId)))

  if (!indexSnapshot.exists()) {
    return []
  }

  const index = indexSnapshot.val() as Record<string, PartyIndexEntry>

  const parties = await Promise.all(
    Object.entries(index).map(async ([partyId, entry]) => {
      const party = await fetchParty(partyId)

      return party ? { party, roleId: entry.roleId } : null
    }),
  )

  return parties.filter((entry): entry is PartyWithRole => entry !== null)
}

export const fetchPartyMembers = async (partyId: string): Promise<PartyMember[]> => {
  const snapshot = await get(dhswRef(DB_PATHS.partyMembersAll(partyId)))

  if (!snapshot.exists()) {
    return []
  }

  return Object.values(snapshot.val() as Record<string, PartyMember>)
}

/**
 * Entrar numa party pelo id dela.
 *
 * **O id é o convite.** É um UUID: adivinhar é impraticável, e o modelo é o
 * mesmo do código de compartilhamento de ficha — quem tem o endereço entra.
 * Simples e suficiente para uma mesa de amigos.
 *
 * **A associação é escrita antes da party ser lida, e a ordem é o ponto.** Ler
 * primeiro para conferir se o grupo existe era o que esta função fazia, e não
 * podia funcionar: a regra de `parties/$partyId` só libera leitura para quem já
 * é membro, então a conferência prévia era negada justamente para quem ainda
 * não entrou — todo código válido caía como "não encontrado".
 *
 * Quem garante que o grupo existe passou a ser a regra de `partyMembers`, que
 * exige `parties/$partyId` presente para entrada de jogador. Código inválido
 * falha na escrita, e é isso que o chamador traduz. A checagem não tinha como
 * ficar no cliente: qualquer teste local seria uma leitura que a regra recusa.
 *
 * O custo é a associação fantasma na corrida em que o grupo some entre a
 * escrita e a leitura — desfeita abaixo, senão o índice do jogador acumularia
 * entradas que não resolvem para nada.
 *
 * O que o modelo custa, e continua custando: o convite não expira e não dá para
 * revogar sem trocar a party de lugar. Um código rotativo é a evolução natural,
 * e ela cabe sem mexer no resto — o `partyId` continua sendo a chave, o código
 * vira só um apontador para ele.
 */
export const joinParty = async (partyId: string, userId: string): Promise<Party> => {
  // Reentrar com o mesmo código não é erro, e precisa ser detectado antes da
  // escrita: a regra recusa reescrever a própria associação já existente, e
  // sem isto quem já é do grupo veria "código não encontrado". O índice do
  // próprio jogador é o único lugar legível por ele antes de pertencer.
  const indexSnapshot = await get(dhswRef(DB_PATHS.userParty(userId, partyId)))

  if (!indexSnapshot.exists()) {
    const member = memberRow(partyId, userId, "player")

    await update(dhswRootRef(), {
      [dhswPath(DB_PATHS.partyMember(partyId, userId))]: sanitize(member),
      [dhswPath(DB_PATHS.userParty(userId, partyId))]: indexEntry(member),
    })
  }

  const party = await fetchParty(partyId)

  if (!party) {
    await leaveParty(partyId, userId)

    throw new Error("Grupo não encontrado")
  }

  return party
}

export const leaveParty = async (partyId: string, userId: string): Promise<void> => {
  await update(dhswRootRef(), {
    [dhswPath(DB_PATHS.partyMember(partyId, userId))]: null,
    [dhswPath(DB_PATHS.userParty(userId, partyId))]: null,
  })
}

/**
 * Promover um membro a Narrador. **Não rebaixa ninguém.**
 *
 * Narrador é papel, e a mesa pode ter vários — promover não tira nada de quem
 * já é. Era o contrário antes, e obrigava quem quisesse sair a abrir mão do
 * papel para outro assumir; com vários Narradores, `canLeaveParty` libera a
 * saída assim que existe um segundo.
 *
 * Recebe o membro inteiro em vez do id porque `joinedAt` e `invitedBy` são
 * dele: remontar a linha do zero reescreveria quando a pessoa entrou.
 */
export const promoteToNarrator = async (member: PartyMember): Promise<PartyMember> => {
  const promoted: PartyMember = { ...member, roleId: "gm", level: PARTY_ROLE_LEVEL.gm }

  await update(dhswRootRef(), {
    [dhswPath(DB_PATHS.partyMember(member.partyId, member.userId))]: sanitize(promoted),
    [dhswPath(DB_PATHS.userParty(member.userId, member.partyId))]: indexEntry(promoted),
  })

  return promoted
}

/**
 * Entregar o grupo a outro Narrador **e sair, na mesma operação**.
 *
 * Posse e saída não podem se separar, e a ordem do estrago mostra por quê: se a
 * saída passasse e a entrega falhasse, o grupo ficaria sem Dono e sem quem
 * pudesse virar um — exatamente o órfão que todo o resto do arquivo evita. Numa
 * escrita só, ou as duas valem ou nenhuma vale.
 *
 * A regra avalia `root` **antes** da escrita, então quem entrega ainda é
 * Narrador no instante em que ela é checada — é isso que autoriza mexer no nó
 * do grupo e apagar a própria linha de membro de uma vez.
 */
export const handOverParty = async (
  partyId: string,
  fromUserId: string,
  toUserId: string,
): Promise<void> => {
  await update(dhswRootRef(), {
    [dhswPath(`${DB_PATHS.party(partyId)}/createdBy`)]: toUserId,
    [dhswPath(`${DB_PATHS.party(partyId)}/updatedAt`)]: Date.now(),
    [dhswPath(DB_PATHS.partyMember(partyId, fromUserId))]: null,
    [dhswPath(DB_PATHS.userParty(fromUserId, partyId))]: null,
  })
}

/**
 * Apagar o grupo inteiro. Só Narrador alcança isto.
 *
 * **As fichas não são apagadas — só soltas.** Elas pertencem a quem as
 * escreveu, não à mesa; apagar junto destruiria trabalho alheio por uma decisão
 * que não é de quem o fez. Some o `partyId` delas e o índice da party, e cada
 * ficha volta a ser exatamente o que era antes de entrar.
 *
 * Cada nó é removido individualmente em vez de cortar a subárvore de uma vez:
 * as regras de `partyMembers` e `partySheets` são declaradas no nível do filho,
 * então escrever `null` no pai não tem regra que o autorize e seria recusado.
 * Por isso a função precisa receber quem estava dentro — ela não adivinha, e
 * chamar sem a lista completa deixaria restos inalcançáveis.
 */
export const deleteParty = async (
  partyId: string,
  memberIds: readonly string[],
  sheetIds: readonly string[],
): Promise<void> => {
  const updates: Record<string, unknown> = {
    [dhswPath(DB_PATHS.party(partyId))]: null,
  }

  for (const memberId of memberIds) {
    updates[dhswPath(DB_PATHS.partyMember(partyId, memberId))] = null
    updates[dhswPath(DB_PATHS.userParty(memberId, partyId))] = null
  }

  for (const sheetId of sheetIds) {
    updates[dhswPath(DB_PATHS.partySheet(partyId, sheetId))] = null
    updates[dhswPath(`${DB_PATHS.sheet(sheetId)}/partyId`)] = null
  }

  await update(dhswRootRef(), updates)
}

/**
 * Pôr uma ficha na party, ou tirá-la.
 *
 * Duas escritas que têm que cair juntas: o campo na ficha (que é o que a regra
 * de segurança consulta) e o índice (que é o que lista as fichas da party).
 * Separadas, uma ficha ficaria visível sem aparecer na lista, ou o contrário.
 */
export const setSheetParty = async (
  sheetId: string,
  partyId: string | null,
  previousPartyId: string | null,
): Promise<void> => {
  const updates: Record<string, unknown> = {
    [dhswPath(`${DB_PATHS.sheet(sheetId)}/partyId`)]: partyId,
  }

  if (previousPartyId) {
    updates[dhswPath(DB_PATHS.partySheet(previousPartyId, sheetId))] = null
  }

  if (partyId) {
    updates[dhswPath(DB_PATHS.partySheet(partyId, sheetId))] = true
  }

  await update(dhswRootRef(), updates)
}

/** As fichas da party, já resolvidas. Lidas sob demanda, nunca no roster local. */
export const fetchPartySheets = async (partyId: string): Promise<Character[]> => {
  const indexSnapshot = await get(dhswRef(DB_PATHS.partySheetsAll(partyId)))

  if (!indexSnapshot.exists()) {
    return []
  }

  const sheetIds = Object.keys(indexSnapshot.val() as Record<string, true>)

  const sheets = await Promise.all(
    sheetIds.map(async (sheetId) => {
      const snapshot = await get(dhswRef(DB_PATHS.sheet(sheetId)))

      return snapshot.exists() ? (snapshot.val() as Character) : null
    }),
  )

  return sheets.filter((sheet): sheet is Character => sheet !== null)
}

export const renameParty = async (partyId: string, name: string): Promise<void> => {
  await update(dhswRef(DB_PATHS.party(partyId)), { name, updatedAt: Date.now() })
}
