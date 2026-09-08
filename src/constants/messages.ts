import type { RuleErrorCode } from '@/types'

/** Codigo de regra → mensagem em pt-br. A UI mapeia; nunca reimplementa a condicao. */
export const RULE_ERROR_MESSAGES: Readonly<Record<RuleErrorCode, string>> = {
  loadoutFull: 'Loadout cheio. Mande uma carta para o vault primeiro.',
  notEnoughStress: 'Stress insuficiente para pagar o Recall Cost.',
  skillUnknown: 'Esta carta não é conhecida por este personagem.',
  skillAlreadyInLoadout: 'Esta carta já está no loadout.',
  armorSlotTaken: 'Já existe uma armadura vestida.',
  weaponSlotTaken: 'Este slot de arma já está ocupado.',
  moduleTierTooHigh: 'Módulo de tier acima do seu não pode ser instalado.',
  noModuleSlots: 'Sem slots de módulo livres neste item.',
  maxLevelReached: 'Nível 10 é o máximo.',
  entryNotFound: 'Item não encontrado no inventário.',
}
