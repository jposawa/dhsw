import type { SheetRole, SheetRoleId, SheetRoleLevel } from "@/types"

/**
 * Papeis de acesso a ficha.
 *
 * Niveis espacados de 10 para caber um papel no meio sem tocar em regra
 * existente — um papel novo e um numero novo, nao uma migracao de esquema.
 */

export const SHEET_ROLE_LEVEL: Readonly<Record<SheetRoleId, SheetRoleLevel>> = {
  reader: 10,
  coAuthor: 20,
  author: 30,
}

export const SHEET_ROLES: readonly SheetRole[] = [
  { id: "reader", level: 10, label: "Leitor" },
  { id: "coAuthor", level: 20, label: "Co-autor" },
  { id: "author", level: 30, label: "Autor" },
]
