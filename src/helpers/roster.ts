import type { Character, RosterState } from '@/types'

/**
 * Junta o roster local com o que veio do Realtime Database.
 *
 * Puro, e é onde a política de conflito fica visível em vez de espalhada.
 *
 * **Resolução por `updatedAt`, no nível do documento.** A ficha mais recente
 * ganha inteira. `dh-sw-arquitetura.md` §6 propõe resolver no nível do campo,
 * o que é melhor e mais caro: exigiria carimbo por campo, e sem isso não há
 * como saber qual lado mexeu em quê.
 *
 * Documento inteiro basta para o caso real de hoje — uma pessoa, dois
 * aparelhos, raramente ao mesmo tempo. O sinal de que deixou de bastar é
 * duas pessoas editando a mesma ficha na mesma sessão: aí uma perde o
 * trabalho em silêncio, e é hora do carimbo por campo.
 *
 * Empate em `updatedAt` fica com o remoto: se os dois dizem a mesma hora,
 * convergir para o que o servidor tem evita dois aparelhos discordando
 * para sempre.
 */
export const mergeRosters = (
  local: RosterState,
  remote: readonly Character[],
): RosterState => {
  const merged: Record<string, Character> = { ...local.characters }

  for (const remoteCharacter of remote) {
    const localCharacter = merged[remoteCharacter.id]

    if (!localCharacter || remoteCharacter.updatedAt >= localCharacter.updatedAt) {
      merged[remoteCharacter.id] = remoteCharacter
    }
  }

  // Ordem: a local manda no que ela já conhece, e o que veio de fora entra
  // no fim, na ordem em que chegou. Reordenar o que a pessoa já tinha na
  // tela por causa de uma sincronização seria mexer no que ela não pediu.
  const known = new Set(local.order)
  const arrived = remote
    .map((character) => character.id)
    .filter((id) => !known.has(id))

  return {
    characters: merged,
    order: [...local.order.filter((id) => merged[id]), ...arrived],
  }
}

/** Fichas que existem só localmente — criadas antes do login, ou offline. */
export const findUnsyncedCharacters = (
  roster: RosterState,
  remoteIds: ReadonlySet<string>,
): Character[] =>
  Object.values(roster.characters).filter((character) => !remoteIds.has(character.id))
