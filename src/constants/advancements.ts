import type { AdvancementOption } from "@/types"

/**
 * Os avanços de nível, na ordem da folha de level up, e quantas vezes cada
 * tier oferece cada um.
 *
 * **O tier é quem abre a opção, não o nível.** Subclasse melhorada,
 * Proficiency e multiclasse só existem do Tier 3 em diante: oferecê-las no
 * Tier 2 dá um personagem que o livro não descreve. O que o Tier 2 pode ter é
 * a multiclasse adiantada, e só com a regra da casa — ver `canMulticlass`.
 *
 * Só o **rótulo** e os **slots** moram aqui. O que cada avanço move é
 * `helpers/advancement.ts`, e quanto ele custa também: esta lista não pode
 * discordar da regra, então não repete nenhum dos dois.
 *
 * Core Rulebook, "Leveling Up" (p. 109–111).
 */
export const ADVANCEMENT_OPTIONS: readonly AdvancementOption[] = [
  { kind: "trait", label: "+1 em dois atributos", slotsByTier: [0, 3, 3, 3] },
  { kind: "hp", label: "+1 Hit Point", slotsByTier: [0, 2, 2, 2] },
  { kind: "stress", label: "+1 Stress", slotsByTier: [0, 2, 2, 2] },
  { kind: "experience", label: "+1 em duas Experiences", slotsByTier: [0, 1, 1, 1] },
  { kind: "domainCard", label: "Carta de domínio", slotsByTier: [0, 1, 1, 1] },
  { kind: "evasion", label: "+1 Evasion", slotsByTier: [0, 1, 1, 1] },
  { kind: "subclass", label: "Subclasse melhorada", slotsByTier: [0, 0, 1, 1] },
  { kind: "proficiency", label: "+1 Proficiency", slotsByTier: [0, 0, 2, 2] },
  /**
   * O 1 no Tier 2 é a regra da casa: sem ela, `canMulticlass` fecha a opção
   * antes de o slot valer. Uma vez só na vida, em qualquer tier (p. 111).
   */
  { kind: "multiclass", label: "Multiclasse", slotsByTier: [0, 1, 1, 1] },
]

/** Quantos atributos e quantas Experiences um avanço desses levanta de uma vez. */
export const ADVANCEMENT_PICKS = 2

/** Multiclasse é uma vez só na vida do personagem (p. 111). */
export const MULTICLASS_LIMIT = 1
