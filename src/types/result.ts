/**
 * Resultado de operacao que pode ser recusada.
 *
 * `rules/` nunca lanca excecao para condicao de regra: a UI mapeia `code`
 * para a mensagem em pt-br e nunca reimplementa a condicao. STANDARDS.md.
 *
 * Os construtores `ok`/`fail` sao funcoes e vivem em `helpers/result.ts`.
 * As mensagens em pt-br vivem em `constants/messages.ts`.
 */

export type Result<TValue> =
  | { ok: true; value: TValue }
  | { ok: false; code: RuleErrorCode; detail?: string }

export type RuleErrorCode =
  | 'loadout_full'
  | 'not_enough_stress'
  | 'skill_unknown'
  | 'skill_already_in_loadout'
  | 'armor_slot_taken'
  | 'weapon_slot_taken'
  | 'module_tier_too_high'
  | 'no_module_slots'
  | 'max_level_reached'
  | 'entry_not_found'
