import type { Character, RosterState } from "@/types"

import { normalizeCharacter } from "./character"

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

/**
 * O roster do `localStorage`, completo.
 *
 * **Leitura local também é fronteira.** `normalizeCharacter` já cuidava do que
 * vem do Realtime Database, mas a ficha que ele devolve sem as listas vazias
 * podia ter sido gravada assim no aparelho por uma versão antiga do app — e aí
 * ficava quebrada para sempre, porque migração só acrescenta campo novo e
 * ninguém mais olhava. Uma ficha sem `inventory` derruba `derive` na primeira
 * linha.
 *
 * Sai daqui também o id que não tem ficha: ordem apontando para nada.
 */
export const normalizeRoster = (roster: RosterState): RosterState => {
  const characters = Object.fromEntries(
    Object.entries(roster.characters ?? {}).map(([id, character]) => [
      id,
      normalizeCharacter(character),
    ]),
  )

  return {
    characters,
    order: (roster.order ?? []).filter((id) => characters[id]),
  }
}
