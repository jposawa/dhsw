import { get, update } from "firebase/database"

import { DB_PATHS, SHEET_ROLE_LEVEL } from "@/constants"
import { normalizeCharacter } from "@/helpers"
import { dhswPath, dhswRef, dhswRootRef } from "@/lib/firebase"
import type {
  Character,
  SheetAccess,
  SheetIndexEntry,
  SheetRoleId,
  SheetWithRole,
} from "@/types"

/**
 * Única camada que fala com o Realtime Database para fichas.
 * Nada acima daqui importa `firebase/database`. Ver BACKEND.md.
 */

/**
 * `undefined` explode no RTDB e `null` apaga o nó. Todo objeto que sai do app
 * passa por aqui: chaves indefinidas são omitidas, não enviadas.
 */
const sanitize = <TValue>(value: TValue): TValue => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item)) as TValue
  }

  if (value === null || typeof value !== "object") {
    return value
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, fieldValue]) => fieldValue !== undefined)
    .map(([key, fieldValue]) => [key, sanitize(fieldValue)])

  return Object.fromEntries(entries) as TValue
}

const accessRow = (
  sheetId: string,
  userId: string,
  roleId: SheetRoleId,
  grantedBy: string,
): SheetAccess => ({
  sheetId,
  userId,
  roleId,
  level: SHEET_ROLE_LEVEL[roleId],
  grantedBy,
  grantedAt: Date.now(),
})

const indexEntry = (access: SheetAccess): SheetIndexEntry => ({
  roleId: access.roleId,
  level: access.level,
  grantedAt: access.grantedAt,
})

/**
 * Criar ficha e a linha de acesso do autor tem que ser UMA operação.
 *
 * Uma ficha sem linha de acesso é inalcançável — invisível para todo mundo,
 * inclusive para quem a criou, e sem conserto pelo cliente. O `update()`
 * multi-caminho do RTDB avalia todos os caminhos como um bloco: se qualquer
 * um reprovar na regra de segurança, nada é escrito.
 */
export const createSheet = async (
  character: Character,
  authorId: string,
): Promise<void> => {
  const access = accessRow(character.id, authorId, "author", authorId)

  await update(dhswRootRef(), {
    [dhswPath(DB_PATHS.sheet(character.id))]: sanitize(character),
    [dhswPath(DB_PATHS.sheetAccess(character.id, authorId))]: sanitize(access),
    [dhswPath(DB_PATHS.userSheet(authorId, character.id))]: indexEntry(access),
  })
}

export const saveSheet = async (character: Character): Promise<void> => {
  await update(dhswRef(DB_PATHS.sheet(character.id)), sanitize(character))
}

export const fetchSheet = async (sheetId: string): Promise<Character | null> => {
  const snapshot = await get(dhswRef(DB_PATHS.sheet(sheetId)))

  // `normalizeCharacter` e nao `as Character`: o RTDB devolve a ficha sem as
  // listas vazias que ela tinha ao subir. Ver `helpers/character.ts`.
  return snapshot.exists() ? normalizeCharacter(snapshot.val() as Character) : null
}

/**
 * Quais fichas este jogador alcança, e com que papel.
 *
 * O RTDB não consulta "todas as fichas onde tenho acesso" — não há join. Por
 * isso `userSheets` existe, e por isso ele guarda o papel junto: sem o papel
 * no índice, saber se esta pessoa pode escrever custaria uma leitura por ficha.
 */
export const fetchSheetsForUser = async (userId: string): Promise<SheetWithRole[]> => {
  const indexSnapshot = await get(dhswRef(DB_PATHS.userSheets(userId)))

  if (!indexSnapshot.exists()) {
    return []
  }

  const index = indexSnapshot.val() as Record<string, SheetIndexEntry>

  const sheets = await Promise.all(
    Object.entries(index).map(async ([sheetId, entry]) => {
      const character = await fetchSheet(sheetId)

      return character ? { character, roleId: entry.roleId } : null
    }),
  )

  return sheets.filter((sheet): sheet is SheetWithRole => sheet !== null)
}

/** Compartilhar: `reader` ou `coAuthor`. `author` é transferência, não concessão. */
export const grantAccess = async (
  sheetId: string,
  targetUserId: string,
  roleId: Exclude<SheetRoleId, "author">,
  grantedBy: string,
): Promise<void> => {
  const access = accessRow(sheetId, targetUserId, roleId, grantedBy)

  await update(dhswRootRef(), {
    [dhswPath(DB_PATHS.sheetAccess(sheetId, targetUserId))]: sanitize(access),
    [dhswPath(DB_PATHS.userSheet(targetUserId, sheetId))]: indexEntry(access),
  })
}

export const revokeAccess = async (
  sheetId: string,
  targetUserId: string,
): Promise<void> => {
  await update(dhswRootRef(), {
    [dhswPath(DB_PATHS.sheetAccess(sheetId, targetUserId))]: null,
    [dhswPath(DB_PATHS.userSheet(targetUserId, sheetId))]: null,
  })
}

export const fetchAccessList = async (sheetId: string): Promise<SheetAccess[]> => {
  const snapshot = await get(dhswRef(DB_PATHS.sheetAccessAll(sheetId)))

  if (!snapshot.exists()) {
    return []
  }

  return Object.values(snapshot.val() as Record<string, SheetAccess>)
}

/**
 * Apagar é do autor. As linhas de acesso e os índices de todo mundo saem
 * junto, senão sobra entrada apontando para ficha que não existe mais.
 */
export const deleteSheet = async (sheetId: string): Promise<void> => {
  const accessList = await fetchAccessList(sheetId)

  const updates: Record<string, null> = {
    [dhswPath(DB_PATHS.sheet(sheetId))]: null,
    [dhswPath(DB_PATHS.sheetAccessAll(sheetId))]: null,
  }

  for (const access of accessList) {
    updates[dhswPath(DB_PATHS.userSheet(access.userId, sheetId))] = null
  }

  await update(dhswRootRef(), updates)
}

/**
 * Sair de uma ficha de outra pessoa: apaga o próprio acesso e o próprio
 * índice, e não toca na ficha. É o que um `reader` faz ao remover da lista.
 */
export const leaveSheet = async (sheetId: string, userId: string): Promise<void> => {
  await revokeAccess(sheetId, userId)
}
