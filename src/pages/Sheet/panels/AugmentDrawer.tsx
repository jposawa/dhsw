import { Button, SectionLabel } from "@jposawa/ronin-ui"

import { RuleText, WideDrawer } from "@/fragments"
import { useCompendium } from "@/hooks"
import { augmentSlotsFor, augmentsOf, installAugment, removeAugment } from "@/helpers"
import type { Character, DerivedStats, HouseRules, Result } from "@/types"

import styles from "./InventoryPanel.module.css"

type AugmentDrawerProps = {
  entryId: string | null
  character: Character
  derived: DerivedStats
  houseRules: HouseRules
  onApply: (result: Result<Character>) => void
  onClose: () => void
}

/**
 * Os augments de uma arma: os instalados, com os slots que sobram, e os que
 * dá para instalar. A regra decide se cabe — Tier mínimo e slots —, e a
 * recusa chega como aviso.
 */
export const AugmentDrawer = ({
  entryId,
  character,
  derived,
  houseRules,
  onApply,
  onClose,
}: AugmentDrawerProps) => {
  const { compendium } = useCompendium()
  const entry = character.inventory.find((candidate) => candidate.id === entryId)
  const installed = entry ? augmentsOf(entry, compendium) : []
  const weapon = compendium.weapons.find((candidate) => candidate.name === entry?.name)
  const slots = augmentSlotsFor(weapon)

  return (
    <WideDrawer isOpen={entry !== undefined} title={entry ? `Augments — ${entry.name}` : ""} onClose={onClose}>
      {entry ? (
        <section className={styles.catalogue} aria-label="Augments">
          <SectionLabel detail={`${installed.length}/${slots} slots`}>
            <h3>INSTALADOS</h3>
          </SectionLabel>

          {installed.length === 0 ? (
            <p className={styles.empty}>Nenhum augment nesta arma.</p>
          ) : (
            <ul className={styles.list}>
              {installed.map((augment) => (
                <li className={styles.row} key={augment.name}>
                  <article className={styles.rowText}>
                    <h4 className={styles.rowName}>{augment.name}</h4>
                    <RuleText className={styles.rowBody} text={augment.text} />
                  </article>
                  <Button
                    variant="text"
                    intent="danger"
                    aria-label={`Tirar ${augment.name}`}
                    onClick={() => onApply(removeAugment(character, entry.id, augment.name))}
                  >
                    TIRAR
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <SectionLabel>
            <h3>DISPONÍVEIS</h3>
          </SectionLabel>

          <ul className={styles.list}>
            {compendium.augments
              .filter((augment) => !entry.installedModules.includes(augment.name))
              .map((augment) => (
                <li className={styles.row} key={augment.name}>
                  <article className={styles.rowText}>
                    <h4 className={styles.rowName}>
                      {augment.name}
                      <span className={styles.quantity}>Tier {augment.tier}</span>
                    </h4>
                    <RuleText className={styles.rowBody} text={augment.text} />
                  </article>
                  <Button
                    variant="outline"
                    disabled={augment.tier > derived.tier}
                    aria-label={`Instalar ${augment.name}`}
                    onClick={() =>
                      onApply(
                        installAugment(character, entry.id, augment.name, derived.tier, houseRules, compendium),
                      )
                    }
                  >
                    INSTALAR
                  </Button>
                </li>
              ))}
          </ul>
        </section>
      ) : null}
    </WideDrawer>
  )
}
