import { Button, Chip, Drawer, Input, SectionLabel } from "@jposawa/ronin-ui"
import React from "react"

import { EQUIP_SLOTS, GEAR_KINDS } from "@/constants"
import { createInventoryEntry, describeNamedArmor, filterByText } from "@/helpers"
import { useCompendium } from "@/hooks"
import { addEntry, candidatesForSlot, consume, equipInSlot, removeEntry } from "@/rules"
import type {
  Character,
  DerivedStats,
  EquipSlot,
  GearKind,
  InventoryEntry,
  InventoryEntryKind,
  Result,
} from "@/types"

import { GearSummary } from "./GearSummary"
import { SlotChoices } from "./SlotChoices"

import styles from "./InventoryPanel.module.css"

/** Chip do catálogo → tipo de linha do inventário. */
const KIND_BY_GEAR: Readonly<Record<GearKind, InventoryEntryKind>> = {
  armas: "weapon",
  armaduras: "armor",
  itens: "item",
  consumiveis: "consumable",
}

/** Mesmo corte da busca de cartas, pelo mesmo motivo: a lista de baixo some. */
const CATALOGUE_SHOWN = 12

type InventoryPanelProps = {
  character: Character
  derived: DerivedStats
  onApply: (result: Result<Character>) => void
}

/**
 * O que o personagem carrega, e o que dele está em uso.
 *
 * **Inventário inteiro é jogada, não progressão.** Pegar despojo, largar peso
 * e trocar de arma acontecem no meio da cena, e obrigar a entrar num modo de
 * edição para isso é pedir que se pare o jogo para mexer na ficha. Grava no
 * toque, como marcador. Editando, cai no rascunho como o resto.
 *
 * **A troca do que está empunhando é uma gaveta, não uma lista de botões.**
 * Três slots — armadura, primária, secundária —, cada um abrindo o que cabe
 * nele. É o gesto certo para "estou com o blaster, quero o sabre": um toque no
 * slot, um na arma. A alternativa era desequipar e procurar, dois passos e uma
 * recusa de slot ocupado no meio.
 */
export const InventoryPanel = ({ character, derived, onApply }: InventoryPanelProps) => {
  const { compendium } = useCompendium()

  const [slotDrawer, setSlotDrawer] = React.useState<EquipSlot | null>(null)
  const [isCatalogueOpen, setIsCatalogueOpen] = React.useState(false)
  const [gearKind, setGearKind] = React.useState<GearKind>("armas")
  const [query, setQuery] = React.useState("")

  const carried = character.inventory.filter((entry) => !entry.isEquipped)

  const catalogue = {
    armas: filterByText(
      compendium.weapons,
      (weapon) => `${weapon.name} ${weapon.trait} ${weapon.feature ?? ""}`,
      query,
    ),
    armaduras: filterByText(
      compendium.namedArmor,
      (piece) => `${piece.name} ${piece.line} ${piece.feature ?? ""}`,
      query,
    ),
    itens: filterByText(compendium.items, (item) => `${item.name} ${item.text}`, query),
    consumiveis: filterByText(compendium.consumables, (item) => `${item.name} ${item.text}`, query),
  }[gearKind]

  const describe = (entry: InventoryEntry): string => {
    if (entry.kind === "weapon") {
      const weapon = compendium.weapons.find((candidate) => candidate.name === entry.name)

      return weapon ? `${weapon.trait} · ${weapon.range} · ${weapon.damageDie}` : "arma"
    }

    if (entry.kind === "armor") {
      const described = describeNamedArmor(compendium, entry.name)

      if (!described) {
        return "armadura"
      }

      const { armor, stats } = described

      return `${armor.line} · Tier ${armor.tier} · Score ${stats.baseScore} · ${stats.majorBase}/${stats.severeBase}`
    }

    return entry.kind === "consumable" ? "consumível" : "item"
  }

  const equippedIn = (slot: EquipSlot): InventoryEntry | undefined =>
    character.inventory.find((entry) => entry.isEquipped && entry.slot === slot)

  const applyAndCloseDrawer = (result: Result<Character>) => {
    onApply(result)
    setSlotDrawer(null)
  }

  return (
    <div className={styles.layout}>
      <section className={styles.equipped}>
        <SectionLabel detail={`Armor Score ${derived.armorScore.total}`}>
          <h3>EM USO</h3>
        </SectionLabel>

        {/* Os três slots aparecem sempre, vazios inclusive: um slot vazio é a
            informação de que ele existe e está livre, e é onde se toca para
            preencher. Escondê-lo faria a armadura sumir da tela justamente
            para quem ainda não vestiu nenhuma. */}
        <ul className={styles.slots}>
          {EQUIP_SLOTS.map((slot) => {
            const entry = equippedIn(slot.id)

            return (
              <li key={slot.id}>
                <button
                  type="button"
                  className={styles.slot}
                  aria-label={`Trocar ${slot.label.toLowerCase()}`}
                  onClick={() => setSlotDrawer(slot.id)}
                >
                  <span className={styles.slotLabel}>{slot.label}</span>
                  <span className={styles.slotName}>{entry ? entry.name : "vazio"}</span>
                  <span className={styles.slotMeta}>
                    {entry ? describe(entry) : "tocar para escolher"}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className={styles.bag}>
        <SectionLabel detail={String(carried.length)}>
          <h3>MOCHILA</h3>
        </SectionLabel>

        {carried.length === 0 ? (
          <p className={styles.empty}>Mochila vazia.</p>
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
                  {entry.kind === "consumable" ? (
                    <Button
                      variant="outline"
                      aria-label={`Usar ${entry.name}`}
                      onClick={() => onApply(consume(character, entry.id))}
                    >
                      USAR
                    </Button>
                  ) : null}

                  <Button
                    variant="text"
                    intent="danger"
                    aria-label={`Largar ${entry.name}`}
                    onClick={() => onApply(removeEntry(character, entry.id))}
                  >
                    LARGAR
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Button isFullWidth variant="outline" onClick={() => setIsCatalogueOpen(true)}>
          + &nbsp;PEGAR EQUIPAMENTO
        </Button>
      </section>

      {/* Gaveta de slot: o que cabe aqui, e a opção de esvaziar. */}
      <Drawer
        isOpen={slotDrawer !== null}
        title={
          slotDrawer
            ? `Escolher ${EQUIP_SLOTS.find((slot) => slot.id === slotDrawer)?.label.toLowerCase()}`
            : ""
        }
        onClose={() => setSlotDrawer(null)}
      >
        {slotDrawer ? (
          <SlotChoices
            candidates={candidatesForSlot(character, slotDrawer)}
            equippedId={equippedIn(slotDrawer)?.id ?? null}
            describe={describe}
            onChoose={(entryId) =>
              applyAndCloseDrawer(equipInSlot(character, slotDrawer, entryId, compendium))
            }
          />
        ) : null}
      </Drawer>

      {/* Gaveta do catálogo: a lista inteira do compêndio fora da página, que é
          o que impede a ficha de virar um formulário de mil linhas. */}
      <Drawer
        isOpen={isCatalogueOpen}
        title="Pegar equipamento"
        onClose={() => setIsCatalogueOpen(false)}
      >
        <div className={styles.catalogue}>
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
              aria-label="Buscar equipamento"
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
                    <GearSummary kind={gearKind} name={option.name} />
                  </div>

                  <Button
                    variant="outline"
                    aria-label={`Pegar ${option.name}`}
                    onClick={() =>
                      onApply(
                        addEntry(
                          character,
                          createInventoryEntry(KIND_BY_GEAR[gearKind], option.name),
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
        </div>
      </Drawer>
    </div>
  )
}
