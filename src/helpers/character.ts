import { CHARACTER_SCHEMA_VERSION, DEFAULT_HOUSE_RULES, STARTING_HOPE, TRAIT_LIST } from "@/constants"
import type { Character, HouseRules, Marks } from "@/types"

import { cryptoDie } from "./dice"
import { NO_HERITAGE } from "./heritage"
import { NO_TRAITS, startingTraitArray } from "./traitArray"

/**
 * Fabrica de ficha em branco. Pura — o id vem de `crypto.randomUUID`.
 * As regras da casa vêm do modelo do perfil de quem cria.
 */
export const createCharacter = (
  name = "",
  houseRules: HouseRules = DEFAULT_HOUSE_RULES,
): Character => {
  const now = Date.now()
  const traitArray = startingTraitArray(houseRules, cryptoDie)

  return {
    id: crypto.randomUUID(),
    schema: CHARACTER_SCHEMA_VERSION,
    name,
    createdAt: now,
    updatedAt: now,
    avatarUrl: null,
    heritage: NO_HERITAGE,
    community: null,
    className: null,
    subclass: null,
    level: 1,
    // `null` é o array do livro. A regra da casa que sorteia escreve aqui —
    // ver `helpers/traitArray.ts`.
    traitArray,
    // Nenhum atributo escolhido: `null` é "por distribuir", e é o que faz a
    // tela saber que os seis valores ainda estão no monte.
    traits: NO_TRAITS,
    partyId: null,
    houseRules,
    marks: { hp: 0, stress: 0, armor: 0, hope: STARTING_HOPE },
    tokens: [],
    loadout: [],
    vault: [],
    inventory: [],
    featureNotes: {},
    advancements: [],
    experiences: [],
    notes: "",
  }
}

/** Copia de uma ficha: id novo, carimbos novos, o resto identico. */
export const duplicateCharacter = (source: Character): Character => {
  const name = `${source.name || "Sem nome"} (cópia)`
  const now = Date.now()

  return {
    ...source,
    id: crypto.randomUUID(),
    name,
    createdAt: now,
    updatedAt: now,
    // A cópia nasce fora da mesa. Copiar o vínculo daria uma ficha que se diz
    // de um grupo que nunca a listou — o índice da party é escrita à parte, e
    // ninguém a fez por ela.
    partyId: null,
  }
}

/** Marca a ficha como alterada agora. Isola o `Date.now` do corpo do componente. */
export const touchCharacter = (character: Character): Character => ({
  ...character,
  updatedAt: Date.now(),
})

/** Marcador ausente vale zero — nada marcado, nenhuma Hope. */
const NO_MARKS: Marks = { hp: 0, stress: 0, armor: 0, hope: 0 }

/**
 * Completa o que o Realtime Database engole.
 *
 * **O RTDB não guarda lista nem objeto vazio — ele apaga a chave.** Uma ficha
 * sem inventário, sem cartas e sem advancements sobe com cinco listas vazias e
 * volta sem nenhuma delas, e a primeira linha de `resolveEquippedArmor` bate
 * num `character.inventory` que não existe.
 *
 * Uma regra só: **campo ausente vale o da ficha em branco**. Os objetos
 * aninhados se mesclam à parte, porque o espalhamento de cima trocaria cada um
 * inteiro — uma ficha com metade dos traços perderia a outra metade, e regra
 * da casa nova nasceria ausente em ficha antiga.
 *
 * **Marcador é a exceção, e vale zero**, não o da ficha em branco: o banco
 * apaga `hope: 0`, e quem gastou toda a Hope voltaria com ela cheia.
 *
 * Mora aqui, na fronteira de leitura, e não em `rules/`: o contrato de
 * `Character` é que os campos existem, e defender cada um dentro do cálculo
 * espalharia o conserto por toda regra — hoje a armadura, amanhã o loadout.
 */
export const normalizeCharacter = (stored: Character): Character => {
  const blank = createCharacter()

  return {
    ...blank,
    ...stored,
    // `sources` entra fundo: o RTDB apaga campo nulo, e uma mista com só a
    // 1ª espécie volta de lá como `{ first }` — a mesclagem rasa deixaria
    // `second` indefinido, e `heritageFeatures` lê as duas.
    featureNotes: { ...stored.featureNotes },
    traitArray: stored.traitArray ?? null,
    heritage: {
      ...blank.heritage,
      ...stored.heritage,
      sources: { ...blank.heritage.sources, ...stored.heritage?.sources },
    },
    // Atributo ausente é atributo por distribuir. O RTDB apaga a chave de
    // valor `null` e guarda o `0`, então a volta é sem ambiguidade: o que
    // faltou nunca foi escolhido.
    traits: { ...NO_TRAITS, ...stored.traits },
    marks: { ...NO_MARKS, ...stored.marks },
    houseRules: { ...blank.houseRules, ...stored.houseRules },
  }
}

/**
 * Os campos que o modo edição altera.
 *
 * Marcador não está aqui de propósito: ele é gravado no toque pelo modo jogo, e
 * contá-lo como alteração pendente faria "Salvar" acender por ter marcado um
 * Stress. `updatedAt` também fica de fora — ele muda em toda gravação e diria
 * que há mudança sempre.
 */
const EDITED_FIELDS = [
  "name",
  "avatarUrl",
  "featureNotes",
  "traitArray",
  "level",
  "className",
  "subclass",
  "community",
  "notes",
] as const

/** As listas que o modo edição altera. Comparadas por conteúdo, não por referência. */
const EDITED_LISTS = ["loadout", "vault", "inventory", "experiences"] as const

/**
 * O rascunho difere do que está salvo? É o que acende o botão de salvar.
 *
 * As listas entram por serialização e não campo a campo: `loadout` e `vault`
 * são de string, `inventory` e `experiences` de objeto raso, e comparar por
 * referência diria que mudou sempre — `rules/` devolve arrays novos a cada
 * operação, inclusive quando o conteúdo é o mesmo.
 */
export const hasSheetEdits = (draft: Character, saved: Character): boolean => {
  const hasFieldChange = EDITED_FIELDS.some((field) => draft[field] !== saved[field])

  if (hasFieldChange) {
    return true
  }

  if (TRAIT_LIST.some((trait) => draft.traits[trait] !== saved.traits[trait])) {
    return true
  }

  if (JSON.stringify(draft.heritage) !== JSON.stringify(saved.heritage)) {
    return true
  }

  if (JSON.stringify(draft.houseRules) !== JSON.stringify(saved.houseRules)) {
    return true
  }

  return EDITED_LISTS.some(
    (field) => JSON.stringify(draft[field]) !== JSON.stringify(saved[field]),
  )
}

/**
 * As regras da casa que valem para a ficha: as da mesa, quando ela está numa e
 * elas já chegaram; senão, as dela. `null` é mesa sem acesso ou ainda lendo.
 */
export const effectiveHouseRules = (
  character: Character,
  partyRules: HouseRules | null,
): HouseRules =>
  character.partyId && partyRules ? { ...DEFAULT_HOUSE_RULES, ...partyRules } : character.houseRules
