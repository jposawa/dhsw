import { Button, Drawer, SectionLabel } from "@jposawa/ronin-ui"
import { useAtomValue } from "jotai"
import React from "react"

import { EQUIP_SLOTS, GEAR_KINDS } from "@/constants"
import { describeNamedArmor } from "@/helpers"
import { useCompendium } from "@/hooks"
import { augmentSlotsFor, candidatesForSlot, consume, equipInSlot, removeEntry } from "@/rules"
import { houseRulesAtom } from "@/states"
import type { Character, DerivedStats, EquipSlot, GearKind, InventoryEntry, Result } from "@/types"

import { AugmentDrawer } from "./AugmentDrawer"
import { CatalogueDrawer } from "./CatalogueDrawer"
import { SlotChoices } from "./SlotChoices"

import styles from "./InventoryPanel.module.css"

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
 * nele. Pegar equipamento novo é uma gaveta por tipo.
 *
 * Com a regra da casa de armas customizáveis, cada arma ganha o botão dos
 * augments dela.
 */
export const InventoryPanel = ({ character, derived, onApply }: InventoryPanelProps) => {
  const { compendium } = useCompendium()
  const houseRules = useAtomValue(houseRulesAtom)

  const [slotDrawer, setSlotDrawer] = React.useState<EquipSlot | null>(null)
  const [catalogueKind, setCatalogueKind] = React.useState<GearKind | null>(null)
  const [augmentEntryId, setAugmentEntryId] = React.useState<string | null>(null)

  const carried = character.inventory.filter((entry) => !entry.isEquipped)

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

  const slotsOf = (entry: InventoryEntry) =>
    augmentSlotsFor(compendium.weapons.find((weapon) => weapon.name === entry.name))

  const augmentButtonFor = (entry: InventoryEntry | undefined) =>
    houseRules.hasCustomWeapons && entry?.kind === "weapon" && slotsOf(entry) > 0 ? (
      <Button
        className={styles.augmentButton}
        variant="text"
        aria-label={`Augments de ${entry.name}`}
        onClick={() => setAugmentEntryId(entry.id)}
      >
        AUGMENTS {entry.installedModules.length}/{slotsOf(entry)}
      </Button>
    ) : null

  return (
    <div className={styles.layout}>
      <section className={styles.equipped}>
        <SectionLabel detail={`Armor Score ${derived.armorScore.total}`}>
          <h3>EM USO</h3>
        </SectionLabel>

        {/* Os três slots aparecem sempre, vazios inclusive: um slot vazio é a
            informação de que ele existe e está livre, e é onde se toca para
            preencher. */}
        <ul className={styles.slots}>
          {EQUIP_SLOTS.map((slot) => {
            const entry = equippedIn(slot.id)

            return (
              <li className={styles.slotItem} key={slot.id}>
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
                {augmentButtonFor(entry)}
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
                <hgroup className={styles.rowText}>
                  <h4 className={styles.rowName}>
                    {entry.name}
                    {entry.quantity > 1 ? (
                      <span className={styles.quantity}>×{entry.quantity}</span>
                    ) : null}
                  </h4>
                  <p className={styles.rowMeta}>{describe(entry)}</p>
                </hgroup>

                <menu className={styles.rowActions}>
                  {augmentButtonFor(entry)}

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
                </menu>
              </li>
            ))}
          </ul>
        )}

        {/* Um botão por tipo, e cada um abre só aquele catálogo. */}
        <menu className={styles.pickButtons}>
          {GEAR_KINDS.map((option) => (
            <Button key={option.id} variant="outline" onClick={() => setCatalogueKind(option.id)}>
              + {option.label.toUpperCase()}
            </Button>
          ))}
        </menu>
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

      <CatalogueDrawer
        kind={catalogueKind}
        character={character}
        onApply={onApply}
        onClose={() => setCatalogueKind(null)}
      />

      <AugmentDrawer
        entryId={augmentEntryId}
        character={character}
        derived={derived}
        houseRules={houseRules}
        onApply={onApply}
        onClose={() => setAugmentEntryId(null)}
      />
    </div>
  )
}
