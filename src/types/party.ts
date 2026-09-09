/**
 * Grupo de jogo — o "party".
 *
 * Nome escolhido entre `Group` e `Party`: **Party**. `Group` é genérico e
 * colidiria com qualquer agrupamento futuro (de cartas, de itens); `Party` é o
 * termo nativo do gênero e diz exatamente o que a coisa é — as pessoas que
 * jogam juntas e as fichas delas.
 *
 * A relação entre jogador e party é N:N com atributos (papel, quando entrou,
 * quem convidou), então é entidade própria — mesmo raciocínio de `SheetAccess`.
 *
 * A relação entre ficha e party, essa é 1:N de verdade: uma ficha pertence a
 * uma party ou a nenhuma. Por isso ali é campo (`Character.partyId`), e não
 * uma terceira tabela — a razão de `SheetAccess` existir não se aplica.
 */

export type PartyRoleId = 'player' | 'gm'

/** Espaçados de 10, como os papéis de ficha, para caber um no meio depois. */
export type PartyRoleLevel = 10 | 20

export type PartyRole = {
  id: PartyRoleId
  level: PartyRoleLevel
  /** pt-br, para a UI. */
  label: string
}

export type Party = {
  id: string
  name: string
  createdBy: string
  createdAt: number
  updatedAt: number
  notes: string
}

export type PartyMember = {
  partyId: string
  userId: string
  roleId: PartyRoleId
  /**
   * Duplicado a partir de `roleId`: a regra de segurança do RTDB não faz join
   * e precisa do número no próprio nó. Escrito só pelo serviço.
   */
  level: PartyRoleLevel
  joinedAt: number
  /**
   * Quem convidou nominalmente — ausente quando a entrada veio pelo código,
   * que é o caso de todas hoje. O `partyId` **é** o convite, então não existe
   * convidante para registrar, e preencher com o criador ou com o próprio
   * jogador seria inventar procedência. Fica para quando houver convite de
   * verdade; ver `joinParty`.
   */
  invitedBy?: string
}

/** O que fica em `userParties/<uid>/<partyId>` — índice invertido com o papel. */
export type PartyIndexEntry = {
  roleId: PartyRoleId
  level: PartyRoleLevel
  joinedAt: number
}

/** Uma party que o jogador alcança, com o papel dele nela. */
export type PartyWithRole = {
  party: Party
  roleId: PartyRoleId
}

/** Membro já resolvido contra o perfil, para a lista de membros. */
export type PartyMemberView = {
  member: PartyMember
  displayName: string
  photoUrl: string | null
}
