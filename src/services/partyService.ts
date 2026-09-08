import { get, update } from 'firebase/database'

import { DB_PATHS, PARTY_ROLE_LEVEL } from '@/constants'
import { dhswPath, dhswRef, dhswRootRef } from '@/lib/firebase'
import type {
  Character,
  Party,
  PartyIndexEntry,
  PartyMember,
  PartyRoleId,
  PartyWithRole,
} from '@/types'

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

  if (value === null || typeof value !== 'object') {
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
  invitedBy: string,
): PartyMember => ({
  partyId,
  userId,
  roleId,
  level: PARTY_ROLE_LEVEL[roleId],
  joinedAt: Date.now(),
  invitedBy,
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
    notes: '',
  }

  const member = memberRow(party.id, userId, 'gm', userId)

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
 * O que isso custa: o convite não expira e não dá para revogar sem trocar a
 * party de lugar. Um código rotativo é a evolução natural, e ela cabe sem
 * mexer no resto — o `partyId` continua sendo a chave, o código vira só um
 * apontador para ele.
 */
export const joinParty = async (partyId: string, userId: string): Promise<Party> => {
  const party = await fetchParty(partyId)

  if (!party) {
    throw new Error('Grupo não encontrado')
  }

  const member = memberRow(partyId, userId, 'player', party.createdBy)

  await update(dhswRootRef(), {
    [dhswPath(DB_PATHS.partyMember(partyId, userId))]: sanitize(member),
    [dhswPath(DB_PATHS.userParty(userId, partyId))]: indexEntry(member),
  })

  return party
}

export const leaveParty = async (partyId: string, userId: string): Promise<void> => {
  await update(dhswRootRef(), {
    [dhswPath(DB_PATHS.partyMember(partyId, userId))]: null,
    [dhswPath(DB_PATHS.userParty(userId, partyId))]: null,
  })
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
