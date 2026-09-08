import type { PartyRole, PartyRoleId, PartyRoleLevel } from '@/types'

export const PARTY_ROLE_LEVEL: Readonly<Record<PartyRoleId, PartyRoleLevel>> = {
  player: 10,
  gm: 20,
}

export const PARTY_ROLES: readonly PartyRole[] = [
  { id: 'player', level: 10, label: 'Jogador' },
  { id: 'gm', level: 20, label: 'Mestre' },
]

/** Nome de party vazio não ajuda ninguém a reconhecer a mesa na lista. */
export const PARTY_NAME_MAX_LENGTH = 60
