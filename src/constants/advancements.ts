import type { AdvancementKind } from "@/types"

/**
 * Os avanços que a tela oferece, na ordem em que os mostra.
 *
 * Só o **rótulo** mora aqui. O que cada um move é `helpers/advancement.ts`, e
 * quanto custa também — esta lista não pode discordar da regra, então não
 * repete nenhum dos dois.
 *
 * Core Rulebook, "Leveling Up" (p. 109–111).
 */
export const ADVANCEMENT_OPTIONS: readonly { kind: AdvancementKind; label: string }[] = [
  { kind: "trait", label: "+1 num atributo" },
  { kind: "hp", label: "+1 Hit Point" },
  { kind: "stress", label: "+1 Stress" },
  { kind: "evasion", label: "+1 Evasion" },
  { kind: "domainCard", label: "Uma carta de domínio a mais" },
  { kind: "subclass", label: "Subclasse melhorada" },
  { kind: "proficiency", label: "+1 Proficiency" },
  { kind: "multiclass", label: "Multiclasse" },
]
