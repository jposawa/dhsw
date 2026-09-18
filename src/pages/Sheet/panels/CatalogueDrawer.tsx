import { Button, Chip, Input } from "@jposawa/ronin-ui"
import React from "react"

import { GEAR_KINDS, WEAPON_BURDEN_LIST } from "@/constants"
import { createInventoryEntry, filterByText } from "@/helpers"
import { useCompendium } from "@/hooks"
import { addEntry } from "@/rules"
import { WideDrawer } from "@/fragments"
import type { Character, GearKind, InventoryEntryKind, Result } from "@/types"

import { GearSummary } from "./GearSummary"

import styles from "./InventoryPanel.module.css"

/** Tipo do catálogo → tipo de linha do inventário. */
const KIND_BY_GEAR: Readonly<Record<GearKind, InventoryEntryKind>> = {
  armas: "weapon",
  armaduras: "armor",
  itens: "item",
  consumiveis: "consumable",
}

const ARMOR_LINE_FILTERS = ["Flexible", "Neutra", "Heavy", "Very Heavy"] as const

type CatalogueDrawerProps = {
  kind: GearKind | null
  character: Character
  onApply: (result: Result<Character>) => void
  onClose: () => void
}

/**
 * Pegar equipamento de um tipo só: arma, armadura, item ou consumível.
 *
 * Uma gaveta por tipo, aberta pelo botão do tipo, em vez de uma gaveta com os
 * quatro misturados atrás de chips. Dentro dela, um filtro que faz sentido
 * para o tipo: ônus para arma, linha para armadura.
 *
 * Sem corte na lista: o catálogo inteiro cabe, e cortar em doze escondia metade
 * das armas sem aviso.
 */
export const CatalogueDrawer = ({ kind, character, onApply, onClose }: CatalogueDrawerProps) => {
  const { compendium } = useCompendium()
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<string | null>(null)

  const handleClose = () => {
    setQuery("")
    setFilter(null)
    onClose()
  }

  const toggleFilter = (value: string) => {
    setFilter(filter === value ? null : value)
  }

  const optionsFor = (gearKind: GearKind): readonly { name: string }[] => {
    if (gearKind === "armas") {
      return filterByText(
        compendium.weapons.filter((weapon) => filter === null || weapon.burden === filter),
        (weapon) => `${weapon.name} ${weapon.trait} ${weapon.feature ?? ""}`,
        query,
      )
    }

    if (gearKind === "armaduras") {
      return filterByText(
        compendium.namedArmor.filter((armor) => filter === null || armor.line === filter),
        (armor) => `${armor.name} ${armor.line} ${armor.feature ?? ""}`,
        query,
      )
    }

    const entries = gearKind === "itens" ? compendium.items : compendium.consumables

    return filterByText(entries, (entry) => `${entry.name} ${entry.text}`, query)
  }

  const filtersFor = (gearKind: GearKind | null): readonly string[] => {
    if (gearKind === "armas") {
      return WEAPON_BURDEN_LIST
    }

    return gearKind === "armaduras" ? ARMOR_LINE_FILTERS : []
  }

  const filters = filtersFor(kind)
  const options = kind ? optionsFor(kind) : []
  const label = GEAR_KINDS.find((option) => option.id === kind)?.label.toLowerCase() ?? ""

  return (
    <WideDrawer isOpen={kind !== null} title={`Pegar ${label}`} onClose={handleClose}>
      <section className={styles.catalogue} aria-label={`Catálogo de ${label}`}>
        {filters.length > 0 ? (
          <p className={styles.chips}>
            {filters.map((value) => (
              <Chip
                key={value}
                label={value}
                isActive={filter === value}
                onToggle={() => toggleFilter(value)}
              />
            ))}
          </p>
        ) : null}

        <search>
          <Input
            type="search"
            value={query}
            placeholder={`Buscar ${label}`}
            aria-label={`Buscar ${label}`}
            autoComplete="off"
            onValueChange={setQuery}
          />
        </search>

        {options.length === 0 ? (
          <p className={styles.empty}>Nada encontrado.</p>
        ) : (
          <ul className={styles.list}>
            {options.map((option) => (
              <li className={styles.row} key={option.name}>
                <article className={styles.rowText}>
                  <h4 className={styles.rowName}>{option.name}</h4>
                  {kind ? <GearSummary kind={kind} name={option.name} /> : null}
                </article>

                <Button
                  variant="outline"
                  aria-label={`Pegar ${option.name}`}
                  onClick={() =>
                    kind
                      ? onApply(addEntry(character, createInventoryEntry(KIND_BY_GEAR[kind], option.name)))
                      : undefined
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
