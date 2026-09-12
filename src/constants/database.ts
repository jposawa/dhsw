import type { DatabaseEnvironment } from "@/types"

/**
 * Caminhos do Realtime Database.
 *
 * Todos relativos — a âncora `/dhsw/<env>` é aplicada por `dhswRef` em
 * `lib/firebase.ts`, e é lá que a garantia mora. Aqui não existe caminho
 * absoluto, e nenhum destes começa com `/`.
 *
 * A árvore, por inteiro:
 *
 *   dhsw/
 *     stage/
 *       config/                        leitura pública
       compendium/<coleção>           leitura pública — cartas, classes, equipamento
 *       profiles/<uid>
 *       sheets/<sheetId>
 *       sheetAccess/<sheetId>/<uid>    { roleId, level, grantedBy, grantedAt }
 *       userSheets/<uid>/<sheetId>     { roleId, level, grantedAt }
 *       settings/<uid>/houseRules
 *     prod/
 *       ... idêntico
 *
 * O ramo (`stage` | `prod`) vem de VITE_DATABASE_TARGET_ENV e é aplicado
 * junto com a raiz por `dhswRef`. Ver BACKEND.md.
 */

export const DATABASE_ROOT = "dhsw"

export const DATABASE_ENVIRONMENTS: Readonly<Record<"Stage" | "Prod", DatabaseEnvironment>> = {
  Stage: "stage",
  Prod: "prod",
}

export const DB_PATHS = {
  /** Leitura pública, escrita nunca pelo cliente. Ver CONFIG.md. */
  config: "config",

  /**
   * Leitura pública, escrita nunca pelo cliente. Uma chave por coleção
   * (`compendium/skills`, `compendium/classes`…), no formato de `compendium/data/`.
   */
  compendium: "compendium",

  profile: (userId: string) => `profiles/${userId}`,

  sheets: "sheets",
  sheet: (sheetId: string) => `sheets/${sheetId}`,

  /** Papel de cada jogador numa ficha. Carrega `level` para a regra de segurança comparar. */
  sheetAccessAll: (sheetId: string) => `sheetAccess/${sheetId}`,
  sheetAccess: (sheetId: string, userId: string) => `sheetAccess/${sheetId}/${userId}`,

  /**
   * Índice invertido: quais fichas este jogador alcança, e com que papel.
   *
   * Desnormalização obrigatória — o RTDB não consulta "todas as fichas onde
   * tenho acesso". Guarda o papel junto, e não apenas `true`, porque sem ele
   * montar o roster custaria uma leitura de `sheetAccess` por ficha.
   * Escrito na mesma operação atômica de `sheetAccess`, nunca sozinho.
   */
  userSheets: (userId: string) => `userSheets/${userId}`,
  userSheet: (userId: string, sheetId: string) => `userSheets/${userId}/${sheetId}`,

  houseRules: (userId: string) => `settings/${userId}/houseRules`,

  /* ── party ── */
  party: (partyId: string) => `parties/${partyId}`,
  partyMembersAll: (partyId: string) => `partyMembers/${partyId}`,
  partyMember: (partyId: string, userId: string) => `partyMembers/${partyId}/${userId}`,
  /** Indice invertido: quais parties este jogador alcanca, com o papel. */
  userParties: (userId: string) => `userParties/${userId}`,
  userParty: (userId: string, partyId: string) => `userParties/${userId}/${partyId}`,
  /** Quais fichas estao na party. O RTDB nao consulta `sheets` por `partyId`. */
  partySheetsAll: (partyId: string) => `partySheets/${partyId}`,
  partySheet: (partyId: string, sheetId: string) => `partySheets/${partyId}/${sheetId}`,
} as const
