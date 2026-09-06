/**
 * Acesso a ficha — o paralelo com `PetAccess` do ficha-pet.
 *
 * Um Jogador tem N Fichas, sendo o autor delas. Pode manter privadas ou
 * compartilhar em dois niveis: Leitor ou Co-Autor. A relacao entre jogador e
 * ficha e N:N com atributos (papel, quem concedeu, quando), e por isso e
 * entidade propria — nao uma coluna `authorId` na ficha.
 *
 * Nao existe `authorId` em `Character`. Quem e o autor e a linha de acesso
 * com papel `author`.
 *
 * Os niveis numericos vivem em `constants/access.ts`.
 */

export type SheetRoleId = 'reader' | 'co_author' | 'author'

/** Espacados de 10 para caber um papel no meio sem tocar em regra existente. */
export type SheetRoleLevel = 10 | 20 | 30

export type SheetRole = {
  id: SheetRoleId
  level: SheetRoleLevel
  /** pt-br, para a UI. */
  label: string
}

export type SheetAccess = {
  sheetId: string
  userId: string
  roleId: SheetRoleId
  /**
   * Duplicado a partir de `roleId` de proposito: a regra de seguranca do
   * Realtime Database nao faz join, entao precisa do numero no proprio no
   * para comparar. Escrito so pelo servico, nunca pela UI.
   */
  level: SheetRoleLevel
  grantedBy: string
  grantedAt: number
}

export type Profile = {
  userId: string
  displayName: string
  /** Espelha o provedor de auth; nao editavel pelo dono. */
  email: string
  photoUrl: string | null
}

/**
 * O que fica em `userSheets/<uid>/<sheetId>`.
 *
 * Carrega o papel, e nao apenas `true`, porque o RTDB nao faz join: sem isso,
 * listar o roster com o papel de cada ficha custaria uma leitura por ficha.
 * Escrito na mesma operacao atomica de `sheetAccess`, nunca sozinho — e a
 * terceira desnormalizacao forcada pela ausencia de join. Ver BACKEND.md.
 */
export type SheetIndexEntry = {
  roleId: SheetRoleId
  level: SheetRoleLevel
  grantedAt: number
}

/** Uma ficha alcancavel pelo jogador, com o papel dele nela. */
export type SheetWithRole = {
  character: import('./character').Character
  roleId: SheetRoleId
}
