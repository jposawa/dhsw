import type { RuleErrorCode } from '@/types'

/** Codigo de regra → mensagem em pt-br. A UI mapeia; nunca reimplementa a condicao. */
export const RULE_ERROR_MESSAGES: Readonly<Record<RuleErrorCode, string>> = {
  loadout_full: 'Loadout cheio. Mande uma carta para o vault primeiro.',
  not_enough_stress: 'Stress insuficiente para pagar o Recall Cost.',
  skill_unknown: 'Esta carta não é conhecida por este personagem.',
  skill_already_in_loadout: 'Esta carta já está no loadout.',
  armor_slot_taken: 'Já existe uma armadura vestida.',
  weapon_slot_taken: 'Este slot de arma já está ocupado.',
  module_tier_too_high: 'Módulo de tier acima do seu não pode ser instalado.',
  no_module_slots: 'Sem slots de módulo livres neste item.',
  max_level_reached: 'Nível 10 é o máximo.',
  entry_not_found: 'Item não encontrado no inventário.',
}
