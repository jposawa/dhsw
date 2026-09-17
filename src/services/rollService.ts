import {
  get,
  limitToLast,
  onValue,
  orderByChild,
  push,
  query,
  serverTimestamp,
  set,
  update,
} from "firebase/database"

import { DB_PATHS, PARTY_ROLL_LIMIT, PARTY_ROLLS_SHOWN } from "@/constants"
import { normalizeRollRecord, overflowingRolls, sanitize } from "@/helpers"
import { dhswRef } from "@/lib/firebase"
import type { RollRecord, RollVisibility } from "@/types"

/**
 * Rolagens da mesa, em `partyRolls/<mesa>/public` e `partyRolls/<mesa>/gm`.
 *
 * Jogador grava sempre em `public`; o Narrador escolhe. Quem não é Narrador
 * nem assina o nó `gm` — a tela decide o que ler.
 */

/** Grava a rolagem. A hora é a do servidor, para a ordem valer entre aparelhos. */
export const pushPartyRoll = async (partyId: string, record: RollRecord): Promise<void> => {
  const target = push(dhswRef(DB_PATHS.partyRolls(partyId, record.visibility)))
  // O id é a chave do nó, e a hora vem do servidor: os dois locais não sobem.
  const stored: Partial<RollRecord> = { ...record }
  delete stored.id
  delete stored.createdAt

  await set(target, { ...sanitize(stored), createdAt: serverTimestamp() })
}

/**
 * Apaga o que passar do limite, das mais antigas. Roda quando alguém abre as
 * rolagens da mesa — qualquer membro, sem ninguém pedir —, e por isso o
 * histórico nunca mostra algo que some logo depois de ser visto.
 */
export const prunePartyRolls = async (
  partyId: string,
  visibility: RollVisibility,
): Promise<void> => {
  const reference = dhswRef(DB_PATHS.partyRolls(partyId, visibility))
  const snapshot = await get(reference)

  if (!snapshot.exists()) {
    return
  }

  const rolls = Object.entries(snapshot.val() as Record<string, { createdAt?: number }>).map(
    ([id, stored]) => ({ id, createdAt: stored.createdAt ?? 0 }),
  )
  const overflow = overflowingRolls(rolls, PARTY_ROLL_LIMIT)

  if (overflow.length > 0) {
    await update(reference, Object.fromEntries(overflow.map((roll) => [roll.id, null])))
  }
}

/**
 * Assina as últimas rolagens de um nó, da mais nova para a mais antiga.
 * Falha de leitura vira lista vazia: histórico não pode derrubar a mesa.
 */
export const subscribePartyRolls = (
  partyId: string,
  visibility: RollVisibility,
  onChange: (rolls: RollRecord[]) => void,
): (() => void) =>
  onValue(
    query(
      dhswRef(DB_PATHS.partyRolls(partyId, visibility)),
      orderByChild("createdAt"),
      limitToLast(PARTY_ROLLS_SHOWN),
    ),
    (snapshot) => {
      const rolls: RollRecord[] = []

      snapshot.forEach((child) => {
        rolls.push(normalizeRollRecord(child.key ?? "", child.val() as Partial<RollRecord>))
      })

      onChange(rolls.reverse())
    },
    () => onChange([]),
  )
