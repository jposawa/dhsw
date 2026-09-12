import { CHARACTER_SCHEMA_VERSION, TRAIT_LIST } from "@/constants"
import type { Character, Trait } from "@/types"

/** Fabrica de ficha em branco. Pura — o id vem de `crypto.randomUUID`. */
export const createCharacter = (name = ""): Character => {
  const now = Date.now()

  return {
    id: crypto.randomUUID(),
    schema: CHARACTER_SCHEMA_VERSION,
    name,
    createdAt: now,
    updatedAt: now,
    ancestry: null,
    community: null,
    className: null,
    subclass: null,
    level: 1,
    traits: TRAIT_LIST.reduce(
      (traits, trait) => ({ ...traits, [trait]: 0 }),
      {} as Record<Trait, number>,
    ),
    partyId: null,
    marks: { hp: 0, stress: 0, armor: 0, hope: 0 },
    loadout: [],
    vault: [],
    inventory: [],
    advancements: [],
    experiences: [],
    notes: "",
  }
}

/** Copia de uma ficha: id novo, carimbos novos, o resto identico. */
export const duplicateCharacter = (source: Character): Character => {
  const name = `${source.name || "Sem nome"} (cópia)`
  const now = Date.now()

  return { ...source, id: crypto.randomUUID(), name, createdAt: now, updatedAt: now }
}

/** Marca a ficha como alterada agora. Isola o `Date.now` do corpo do componente. */
export const touchCharacter = (character: Character): Character => ({
  ...character,
  updatedAt: Date.now(),
})

/**
 * Completa o que o Realtime Database engole.
 *
 * **O RTDB não guarda array vazio nem objeto vazio — ele apaga a chave.** Uma
 * ficha nova, sem inventário, sem cartas e sem advancements, sobe com cinco
 * listas vazias e volta sem nenhuma delas. O `as Character` do serviço dizia
 * que estava tudo lá, e a primeira linha de `resolveEquippedArmor` batia num
 * `character.inventory` que não existia: a ficha não abria.
 *
 * Some aqui, na fronteira de leitura, e não em `rules/`: o contrato de
 * `Character` é que os campos existem, e defender cada um deles dentro das
 * regras espalharia o conserto por todo cálculo — hoje a armadura, amanhã o
 * loadout.
 */
export const normalizeCharacter = (stored: Character): Character => {
  const traits = TRAIT_LIST.reduce(
    (filled, trait) => ({ ...filled, [trait]: stored.traits?.[trait] ?? 0 }),
    {} as Record<Trait, number>,
  )

  return {
    ...stored,
    schema: stored.schema ?? CHARACTER_SCHEMA_VERSION,
    name: stored.name ?? "",
    level: stored.level ?? 1,
    ancestry: stored.ancestry ?? null,
    community: stored.community ?? null,
    className: stored.className ?? null,
    subclass: stored.subclass ?? null,
    partyId: stored.partyId ?? null,
    traits,
    marks: {
      hp: stored.marks?.hp ?? 0,
      stress: stored.marks?.stress ?? 0,
      armor: stored.marks?.armor ?? 0,
      hope: stored.marks?.hope ?? 0,
    },
    loadout: stored.loadout ?? [],
    vault: stored.vault ?? [],
    inventory: stored.inventory ?? [],
    advancements: stored.advancements ?? [],
    experiences: stored.experiences ?? [],
    notes: stored.notes ?? "",
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
  "level",
  "className",
  "subclass",
  "ancestry",
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

  return EDITED_LISTS.some(
    (field) => JSON.stringify(draft[field]) !== JSON.stringify(saved[field]),
  )
}
