import { Button, Input, MultiSelect } from "@jposawa/ronin-ui"
import React from "react"

import { GEAR_KINDS, WEAPON_BURDEN_LIST } from "@/constants"
import { WideDrawer } from "@/fragments"
import { createInventoryEntry, filterByText } from "@/helpers"
import { useCompendium } from "@/hooks"
import { addEntry } from "@/rules"
import type { Character, Compendium, GearKind, InventoryEntryKind, Result } from "@/types"

import { GearSummary } from "./GearSummary"

import styles from "./InventoryPanel.module.css"

/** Tipo do catálogo → tipo de linha do inventário. */
const KIND_BY_GEAR: Readonly<Record<GearKind, InventoryEntryKind>> = {
  armas: "weapon",
  armaduras: "armor",
  itens: "item",
  consumiveis: "consumable",
}

const ARMOR_LINES = ["Flexible", "Neutra", "Heavy", "Very Heavy"] as const

/**
 * O recorte que cada tipo aceita, além do nome. Tipo que não aparece aqui não
 * tem recorte — item e consumível se acham pelo texto e mais nada.
 */
const FACETS: Partial<Record<GearKind, { label: string; options: readonly string[] }>> = {
  armas: { label: "Ônus", options: WEAPON_BURDEN_LIST },
  armaduras: { label: "Linha", options: ARMOR_LINES },
}

const ALL_KINDS: readonly GearKind[] = GEAR_KINDS.map((option) => option.id)

/** Uma entrada do catálogo, já achatada: é sobre esta forma que se filtra. */
type Listing = {
  kind: GearKind
  name: string
  /** O valor que o recorte do tipo compara. `null` em tipo sem recorte. */
  facet: string | null
  /** O que a busca por texto varre. */
  text: string
}

/*
 * Os quatro catálogos viram uma lista só na entrada, e não quatro caminhos de
 * filtro: a busca por texto e o recorte são o mesmo código para todos, e um
 * tipo novo é uma linha aqui em vez de mais um ramo em cada função.
 */
const listingsOf = (compendium: Compendium): Listing[] => [
  ...compendium.weapons.map((weapon) => ({
    kind: "armas" as const,
    name: weapon.name,
    facet: weapon.burden,
    text: `${weapon.name} ${weapon.trait} ${weapon.feature ?? ""}`,
  })),
  ...compendium.namedArmor.map((armor) => ({
    kind: "armaduras" as const,
    name: armor.name,
    facet: armor.line,
    text: `${armor.name} ${armor.line} ${armor.feature ?? ""}`,
  })),
  ...compendium.items.map((item) => ({
    kind: "itens" as const,
    name: item.name,
    facet: null,
    text: `${item.name} ${item.text}`,
  })),
  ...compendium.consumables.map((consumable) => ({
    kind: "consumiveis" as const,
    name: consumable.name,
    facet: null,
    text: `${consumable.name} ${consumable.text}`,
  })),
]

type CatalogueDrawerProps = {
  isOpen: boolean
  character: Character
  onApply: (result: Result<Character>) => void
  onClose: () => void
}

/**
 * Pegar equipamento: um catálogo só, estreitado por tipo e pelo recorte de
 * cada tipo.
 *
 * Uma gaveta por tipo obrigava a saber o tipo antes de procurar — e "cadê
 * aquele troço que dá vantagem em stealth" é justamente a busca de quem não
 * sabe. Aqui o tipo é filtro, não porta: nada marcado mostra o catálogo
 * inteiro, e marcar tipos faz aparecer o recorte de cada um (ônus para arma,
 * linha para armadura). Tipo sem recorte não acrescenta caixa nenhuma.
 *
 * Sem corte na lista: o catálogo inteiro cabe, e cortar em doze escondia
 * metade das armas sem aviso.
 */
export const CatalogueDrawer = ({ isOpen, character, onApply, onClose }: CatalogueDrawerProps) => {
  const { compendium } = useCompendium()

  const [query, setQuery] = React.useState("")
  const [kinds, setKinds] = React.useState<readonly GearKind[]>([])
  const [facets, setFacets] = React.useState<Partial<Record<GearKind, readonly string[]>>>({})

  const handleClose = () => {
    setQuery("")
    setKinds([])
    setFacets({})
    onClose()
  }

  /*
   * Desmarcar um tipo leva o recorte dele junto: um filtro que continua
   * valendo com a caixa dele fora da tela é um filtro invisível, e a pessoa
   * procura a arma que sumiu sem ter onde ver por quê.
   */
  const changeKinds = (values: string[]) => {
    const chosen = values as GearKind[]

    setKinds(chosen)
    setFacets(
      Object.fromEntries(
        Object.entries(facets).filter(([kind]) => chosen.includes(kind as GearKind)),
      ),
    )
  }

  const changeFacet = (kind: GearKind, values: string[]) => {
    setFacets({ ...facets, [kind]: values })
  }

  // Nada marcado é tudo marcado: a gaveta abre com o catálogo inteiro à vista.
  const activeKinds = kinds.length > 0 ? kinds : ALL_KINDS

  const shown = filterByText(
    listingsOf(compendium).filter((listing) => {
      if (!activeKinds.includes(listing.kind)) {
        return false
      }

      const chosen = facets[listing.kind] ?? []

      return chosen.length === 0 || (listing.facet !== null && chosen.includes(listing.facet))
    }),
    (listing) => listing.text,
    query,
  )

  const kindOptions = GEAR_KINDS.map((option) => ({ value: option.id, label: option.label }))
  const oneOf = (kind: GearKind) => GEAR_KINDS.find((option) => option.id === kind)?.one ?? ""

  return (
    <WideDrawer isOpen={isOpen} title="Pegar equipamento" onClose={handleClose}>
      <section className={styles.catalogue} aria-label="Catálogo de equipamento">
        <div className={styles.filters}>
          <MultiSelect
            label="TIPO"
            options={kindOptions}
            values={[...kinds]}
            placeholder="Todos os tipos"
            onValuesChange={changeKinds}
          />

          {/* O recorte só existe com o tipo dele marcado: é o tipo que diz
              quais perguntas fazem sentido. */}
          {kinds.map((kind) => {
            const facet = FACETS[kind]

            return facet ? (
              <MultiSelect
                key={kind}
                label={facet.label.toUpperCase()}
                options={facet.options.map((value) => ({ value, label: value }))}
                values={[...(facets[kind] ?? [])]}
                placeholder={`Qualquer ${facet.label.toLowerCase()}`}
                onValuesChange={(values) => changeFacet(kind, values)}
              />
            ) : null
          })}
        </div>

        <search>
          <Input
            type="search"
            value={query}
            placeholder="Buscar equipamento"
            aria-label="Buscar equipamento"
            autoComplete="off"
            onValueChange={setQuery}
          />
        </search>

        {shown.length === 0 ? (
          <p className={styles.empty}>Nada encontrado.</p>
        ) : (
          <ul className={styles.list}>
            {shown.map((listing) => (
              <li className={styles.row} key={`${listing.kind}:${listing.name}`}>
                <article className={styles.rowText}>
                  <h4 className={styles.rowName}>
                    {listing.name}
                    {/* Com os quatro tipos na mesma lista, o nome sozinho não
                        diz o que se está pegando. */}
                    <span className={styles.rowKind}>{oneOf(listing.kind)}</span>
                  </h4>
                  <GearSummary kind={listing.kind} name={listing.name} />
                </article>

                <Button
                  variant="outline"
                  aria-label={`Pegar ${listing.name}`}
                  onClick={() =>
                    onApply(
                      addEntry(
                        character,
                        createInventoryEntry(KIND_BY_GEAR[listing.kind], listing.name),
                      ),
                    )
                  }
                >
                  PEGAR
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </WideDrawer>
  )
}
