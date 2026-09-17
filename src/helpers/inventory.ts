import type { InventoryEntry, InventoryEntryKind } from "@/types"

/**
 * Fábrica de linha de inventário. Pura — o id vem de `crypto.randomUUID`.
 *
 * Mora em `helpers/` e não em `rules/` pelo mesmo motivo de `createCharacter`:
 * gerar id não é regra de Daggerheart, e `rules/` tem que continuar sendo
 * função de entrada para saída, testável sem mock de nada.
 *
 * **Referência por nome, não por id do compêndio** — o compêndio não tem ids, e
 * nome é único dentro de cada tipo. É o que mantém o código de compartilhamento
 * legível.
 */
export const createInventoryEntry = (
  kind: InventoryEntryKind,
  name: string,
  quantity = 1,
): InventoryEntry => ({
  id: crypto.randomUUID(),
  kind,
  name,
  isEquipped: false,
  slot: null,
  quantity,
  installedModules: [],
  nickname: null,
})
