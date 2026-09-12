import type { RuleErrorCode } from "@/types"

/** Codigo de regra → mensagem em pt-br. A UI mapeia; nunca reimplementa a condicao. */
export const RULE_ERROR_MESSAGES: Readonly<Record<RuleErrorCode, string>> = {
  loadoutFull: "Loadout cheio. Mande uma carta para o vault primeiro.",
  notEnoughStress: "Stress insuficiente para pagar o Recall Cost.",
  skillUnknown: "Esta carta não é conhecida por este personagem.",
  skillAlreadyInLoadout: "Esta carta já está no loadout.",
  armorSlotTaken: "Já existe uma armadura vestida.",
  weaponSlotTaken: "Este slot de arma já está ocupado.",
  handsFull: "As duas mãos já estão ocupadas por uma arma de duas mãos.",
  entryNotFound: "Item não encontrado no inventário.",
  entryNotEquippable: "Este item não se equipa.",
  experienceNameMissing: "Dê um nome à Experience.",
  experienceDuplicate: "Já existe uma Experience com esse nome.",
  experienceNotFound: "Experience não encontrada.",
  downtimeNeedsTwoMoves: "Escolha duas ações de descanso — pode ser a mesma duas vezes.",
  downtimeMoveUnknown: "Essa ação não pertence a este descanso.",
  downtimeRollMissing: "Falta o resultado do dado de uma das ações.",
}
