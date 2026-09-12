import { Button, Chip, Input, SectionLabel } from "@jposawa/ronin-ui"
import React from "react"

import { CONSUMABLES, ITEMS, NAMED_ARMOR, WEAPONS } from "@/compendium"
import { GEAR_KINDS } from "@/constants"
import { RuleText } from "@/fragments"
import { createInventoryEntry, filterByText } from "@/helpers"
import { addEntry, consume, equip, removeEntry, unequip } from "@/rules"
import type {
  Character,
  DerivedStats,
  GearKind,
  InventoryEntry,
  InventoryEntryKind,
  Result,
} from "@/types"

import styles from "./InventoryPanel.module.css"

/** Chip do compêndio → tipo de linha do inventário. */
const KIND_BY_GEAR: Readonly<Record<GearKind, InventoryEntryKind>> = {
  armas: "weapon",
  armaduras: "armor",
  itens: "item",
  consumiveis: "consumable",
}

const SLOT_LABELS: Readonly<Record<string, string>> = {
  armor: "ARMADURA",
  primary: "PRIMÁRIA",
  secondary: "SECUNDÁRIA",
}

/**
 * O texto de efeito de uma entrada do catálogo.
 *
 * Os quatro tipos guardam isso em campos diferentes: arma e armadura em
 * `feature`, item e consumível em `text` — e `feature` ainda pode ser nulo,
 * porque nem toda arma tem efeito. Sem esta ponte metade do catálogo aparecia
 * só com o nome, que é o que menos ajuda a escolher.
 */
const describeOption = (option: { feature?: string | null; text?: string }): string =>
  option.text ?? option.feature ?? ""

type InventoryPanelProps = {
  character: Character
  derived: DerivedStats
  isEditing: boolean
  onApply: (result: Result<Character>) => void
}

/**
 * O que o personagem carrega, e o que dele está em uso.
 *
 * **Equipar é jogada, adquirir é progressão** — a mesma divisão das cartas.
 * Trocar de arma no meio da cena grava no toque; pôr um item novo na mochila
 * ou tirar um só vale no modo edição, com Salvar.
 *
 * A armadura equipada é a entrada de `derive` para Armor Score e para os dois
 * limiares, então ela aparece com o efeito ao lado: trocar de armadura sem ver
 * o threshold mudar é trocar às cegas.
 */
export const InventoryPanel = ({
  character,
  derived,
  isEditing,
  onApply,
}: InventoryPanelProps) => {
  const [gearKind, setGearKind] = React.useState<GearKind>("armas")
  const [query, setQuery] = React.useState("")

  const equipped = character.inventory.filter((entry) => entry.isEquipped)
  const carried = character.inventory.filter((entry) => !entry.isEquipped)

  const catalogue = {
    armas: filterByText(WEAPONS, (weapon) => `${weapon.name} ${weapon.trait}`, query),
    armaduras: filterByText(NAMED_ARMOR, (piece) => `${piece.name} ${piece.line}`, query),
    itens: filterByText(ITEMS, (item) => `${item.name} ${item.text}`, query),
    consumiveis: filterByText(CONSUMABLES, (item) => `${item.name} ${item.text}`, query),
  }[gearKind]

  const describe = (entry: InventoryEntry): string => {
    if (entry.kind === "weapon") {
      const weapon = WEAPONS.find((candidate) => candidate.name === entry.name)

      return weapon ? `${weapon.trait} · ${weapon.range} · ${weapon.damageDie}` : "arma"
    }

    if (entry.kind === "armor") {
      const piece = NAMED_ARMOR.find((candidate) => candidate.name === entry.name)

      return piece ? `${piece.line} · Tier ${piece.tier}` : "armadura"
    }

    return entry.kind === "consumable" ? "consumível" : "item"
  }

  return (
    <>
      <section className={styles.block}>
        <SectionLabel detail={`${equipped.length}/3`}>
          <h3>EM USO</h3>
        </SectionLabel>

        {equipped.length === 0 ? (
          <p className={styles.empty}>
            Nada equipado. Sem armadura vestida vale Bare Bones — Armor Score{" "}
            {derived.armorScore.total} e limiares {derived.majorThreshold.total}/
            {derived.severeThreshold.total}.
          </p>
        ) : (
          <ul className={styles.list}>
            {equipped.map((entry) => (
              <li className={styles.row} key={entry.id}>
                <div className={styles.rowText}>
                  <h4 className={styles.rowName}>{entry.name}</h4>
                  <p className={styles.rowMeta}>
                    {entry.slot ? SLOT_LABELS[entry.slot] : ""} · {describe(entry)}
                  </p>
                </div>

                <Button
                  variant="outline"
                  aria-label={`Desequipar ${entry.name}`}
                  onClick={() => onApply(unequip(character, entry.id))}
                >
                  TIRAR
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.block}>
        <SectionLabel detail={String(carried.length)}>
          <h3>MOCHILA</h3>
        </SectionLabel>

        {carried.length === 0 ? (
          <p className={styles.empty}>
            Mochila vazia.{" "}
            {isEditing ? "Adicione abaixo." : "Entre em Editar ficha para adicionar."}
          </p>
        ) : (
          <ul className={styles.list}>
            {carried.map((entry) => (
              <li className={styles.row} key={entry.id}>
                <div className={styles.rowText}>
                  <h4 className={styles.rowName}>
                    {entry.name}
                    {entry.quantity > 1 ? (
                      <span className={styles.quantity}>×{entry.quantity}</span>
                    ) : null}
                  </h4>
                  <p className={styles.rowMeta}>{describe(entry)}</p>
                </div>

                <div className={styles.rowActions}>
                  {entry.kind === "weapon" || entry.kind === "armor" ? (
                    <Button
                      variant="outline"
                      aria-label={`Equipar ${entry.name}`}
                      onClick={() => onApply(equip(character, entry.id))}
                    >
                      EQUIPAR
                    </Button>
                  ) : null}

                  {entry.kind === "consumable" ? (
                    <Button
                      variant="outline"
                      aria-label={`Usar ${entry.name}`}
                      onClick={() => onApply(consume(character, entry.id))}
                    >
                      USAR
                    </Button>
                  ) : null}

                  {isEditing ? (
                    <Button
                      variant="text"
                      intent="danger"
                      aria-label={`Tirar ${entry.name} da mochila`}
                      onClick={() => onApply(removeEntry(character, entry.id))}
                    >
                      REMOVER
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {isEditing ? (
        <section className={styles.block}>
          <SectionLabel>
            <h3>ADICIONAR</h3>
          </SectionLabel>

          {/* Chip e não uma segunda régua de abas: aqui é filtro dentro de uma
              tela, e a ficha já tem uma régua acima que confundiria. */}
          <div className={styles.chips}>
            {GEAR_KINDS.map((option) => (
              <Chip
                key={option.id}
                label={option.label}
                isActive={gearKind === option.id}
                onToggle={() => setGearKind(option.id)}
              />
            ))}
          </div>

          <search>
            <Input
              type="search"
              value={query}
              placeholder="Buscar equipamento"
              aria-label="Buscar equipamento para adicionar"
              autoComplete="off"
              onValueChange={setQuery}
            />
          </search>

          {catalogue.length === 0 ? (
            <p className={styles.empty}>Nada encontrado para “{query}”.</p>
          ) : (
            <ul className={styles.list}>
              {catalogue.slice(0, CATALOGUE_SHOWN).map((option) => (
                <li className={styles.row} key={option.name}>
                  <div className={styles.rowText}>
                    <h4 className={styles.rowName}>{option.name}</h4>
                    {describeOption(option) ? (
                      <RuleText className={styles.rowBody} text={describeOption(option)} />
                    ) : null}
                  </div>

                  <Button
                    variant="outline"
                    aria-label={`Adicionar ${option.name}`}
                    onClick={() =>
                      onApply(
                        addEntry(
                          character,
                          createInventoryEntry(KIND_BY_GEAR[gearKind], option.name),
                        ),
                      )
                    }
                  >
                    ADICIONAR
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </>
  )
}

/** Mesmo corte da busca de cartas, pelo mesmo motivo: a lista de baixo some. */
const CATALOGUE_SHOWN = 12
