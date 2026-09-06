import type { HouseRules, RemoteConfig } from '@/types'

import { DEFAULT_HOME } from './appNav'

/**
 * Default embutido no codigo. Banco fora do ar, offline ou no ausente nao
 * podem impedir o app de abrir — o valor remoto e override, nao requisito.
 */
export const DEFAULT_CONFIG: RemoteConfig = {
  isCompendiumSearchEnabled: true,
  minimumSupportedSchema: 1,
  announcement: null,
  // Vazio: sem override, vale o catalogo de `appNav.ts` como esta.
  menuItems: {},
  home: DEFAULT_HOME,
}

/** Escolha da mesa, nao config remota. Viaja no codigo de compartilhamento. */
export const DEFAULT_HOUSE_RULES: HouseRules = {
  hasTwoCardsPerLevel: false,
  hasEvasionFromTraits: false,
  roundsEvasionUp: false,
  loadoutSize: '5',
}
