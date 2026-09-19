import { Button } from "@jposawa/ronin-ui"

import { Switch } from "@/components"
import { WideDrawer } from "@/fragments"
import { forgetSkill, moveToLoadout } from "@/helpers"
import { useCompendium } from "@/hooks"
import type { Character, DerivedStats, Result, Skill } from "@/types"

import { SkillRow } from "./SkillRow"

import styles from "./CardsPanel.module.css"

type VaultDrawerProps = {
  isOpen: boolean
  character: Character
  derived: DerivedStats
  vault: readonly Skill[]
  isEditing: boolean
  isFreeSwap: boolean
  onToggleFreeSwap: () => void
  onApply: (result: Result<Character>) => void
  onClose: () => void
}

/**
 * O vault, numa gaveta.
 *
 * Ele e o loadout dividiam a tela ao meio, e o vault cresce sem limite —
 * enquanto o loadout tem teto de cinco. Meia tela para a lista curta e meia
 * para a longa espremia justamente as cartas que estão em jogo.
 *
 * A troca livre veio junto porque ela só importa aqui: é o interruptor que
 * decide se trazer carta daqui custa Stress.
 */
export const VaultDrawer = ({
  isOpen,
  character,
  derived,
  vault,
  isEditing,
  isFreeSwap,
  onToggleFreeSwap,
  onApply,
  onClose,
}: VaultDrawerProps) => {
  const { compendium } = useCompendium()

  return (
    <WideDrawer isOpen={isOpen} title="Vault" onClose={onClose}>
      <section className={styles.vault} aria-label="Cartas guardadas">
        {/* A troca livre é estado da mesa, não da ficha: vale enquanto durar o
            descanso e não sobrevive ao recarregar. Guardá-la na ficha faria
            alguém voltar no dia seguinte ainda em descanso. */}
        <Switch className={styles.freeSwap} isOn={isFreeSwap} onToggle={onToggleFreeSwap}>
          <span className={styles.freeSwapText}>
            Troca livre
            <span className={styles.hint}>
              {isFreeSwap
                ? "Descansando: trazer carta do vault não custa Stress."
                : "Trazer carta do vault custa Stress igual ao Recall Cost."}
            </span>
          </span>
        </Switch>

        {vault.length === 0 ? (
          <p className={styles.empty}>
            Nenhuma carta guardada. Carta aprendida vai direto para o loadout enquanto houver
            espaço, e cai aqui quando ele enche.
          </p>
        ) : (
          <ul className={styles.list}>
            {vault.map((skill) => (
              <SkillRow
                key={skill.name}
                skill={skill}
                action={
                  <div className={styles.rowActions}>
                    <Button
                      variant="outline"
                      aria-label={`Equipar ${skill.name}`}
                      onClick={() =>
                        onApply(
                          moveToLoadout(character, derived, skill.name, { isFreeSwap }, compendium),
                        )
                      }
                    >
                      EQUIPAR
                    </Button>
                    {isEditing && (
                      <Button
                        variant="text"
                        intent="danger"
                        aria-label={`Esquecer ${skill.name}`}
                        onClick={() => onApply(forgetSkill(character, skill.name))}
                      >
                        ESQUECER
                      </Button>
                    )}
                  </div>
                }
              />
            ))}
          </ul>
        )}
      </section>
    </WideDrawer>
  )
}
