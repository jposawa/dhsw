import { Button, SectionLabel } from "@jposawa/ronin-ui"
import React from "react"

import { Switch } from "@/components"
import { useCompendium } from "@/hooks"
import {
  activeTokenPools,
  domainAccessFor,
  forgetSkill,
  moveToLoadout,
  moveToVault,
  setTokenCount,
  tokenCount,
} from "@/helpers"
import type { Character, DerivedStats, Result, Skill } from "@/types"

import { LearnDrawer } from "./LearnDrawer"
import { SkillRow } from "./SkillRow"
import { TokenCounter } from "./TokenCounter"

import styles from "./CardsPanel.module.css"

type CardsPanelProps = {
  character: Character
  derived: DerivedStats
  isEditing: boolean
  onApply: (result: Result<Character>) => void
}

/**
 * Loadout, vault e o acervo.
 *
 * **A divisão entre os dois modos é a mesma da ficha inteira.** Mover carta
 * entre loadout e vault é jogada — acontece no meio da cena e custa Stress
 * igual ao Recall Cost —, então grava no toque. Aprender e esquecer carta muda
 * o que o personagem *sabe*, é decisão de progressão, e só vale no modo edição
 * com Salvar.
 *
 * Nenhuma condição é avaliada aqui: `rules/loadout.ts` devolve `Result`, e esta
 * tela só renderiza o que ele permitiu. A mesma pergunta respondida em dois
 * lugares diverge no primeiro ajuste de regra da casa.
 */
export const CardsPanel = ({ character, derived, isEditing, onApply }: CardsPanelProps) => {
  const { compendium } = useCompendium()

  const [isFreeSwap, setIsFreeSwap] = React.useState(false)
  const [isLearning, setIsLearning] = React.useState(false)

  const skillsOf = (names: readonly string[]): Skill[] =>
    names
      .map((name) => compendium.skills.find((candidate) => candidate.name === name))
      .filter((skill): skill is Skill => skill !== undefined)

  // Sem classe não há domínio, e sem domínio não há carta ao alcance: o botão
  // abriria uma gaveta vazia.
  const hasDomains = domainAccessFor(character, compendium).length > 0

  const loadout = skillsOf(character.loadout)
  const vault = skillsOf(character.vault)

  // Tokens são jogada, gravada no toque: editando, a ficha é rascunho e o
  // contador sai, para um toque não ir parar no que o Salvar vai sobrescrever.
  const tokenPools = isEditing ? [] : activeTokenPools(character, derived, compendium)
  const tokensOf = (skill: Skill) =>
    tokenPools
      .filter((active) => active.source === "card" && active.owner === skill.name)
      .map((active) => (
        <TokenCounter
          key={active.key}
          active={active}
          count={tokenCount(character, active)}
          onChange={(next) =>
            onApply(setTokenCount(character, active.key, next, derived, compendium))
          }
        />
      ))

  return (
    <div className={styles.layout}>
      <section className={styles.loadout}>
        <SectionLabel detail={`${loadout.length}/${derived.loadoutMax.total}`}>
          <h3>LOADOUT</h3>
        </SectionLabel>

        {/* A troca livre é estado da mesa, não da ficha: vale enquanto durar o
            descanso e não sobrevive ao recarregar. Guardá-la na ficha faria
            alguém voltar no dia seguinte ainda em descanso. */}
        <Switch
          className={styles.freeSwap}
          isOn={isFreeSwap}
          onToggle={() => setIsFreeSwap(!isFreeSwap)}
        >
          <span className={styles.freeSwapText}>
            Troca livre
            <span className={styles.hint}>
              {isFreeSwap
                ? "Descansando: trazer carta do vault não custa Stress."
                : "Trazer carta do vault custa Stress igual ao Recall Cost."}
            </span>
          </span>
        </Switch>

        {loadout.length === 0 ? (
          <p className={styles.empty}>Loadout vazio. Traga uma carta do vault.</p>
        ) : (
          <ul className={styles.list}>
            {loadout.map((skill) => (
              <SkillRow
                key={skill.name}
                skill={skill}
                action={
                  <Button
                    variant="outline"
                    aria-label={`Guardar ${skill.name} no vault`}
                    onClick={() => onApply(moveToVault(character, skill.name))}
                  >
                    GUARDAR
                  </Button>
                }
              >
                {tokensOf(skill)}
              </SkillRow>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.vault}>
        <SectionLabel detail={String(vault.length)}>
          <h3>VAULT</h3>
        </SectionLabel>

        {vault.length === 0 ? (
          <p className={styles.empty}>
            Nenhuma carta guardada.{" "}
            {isEditing ? "Adicione abaixo." : "Entre em Editar ficha para aprender cartas."}
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
                    {isEditing ? (
                      <Button
                        variant="text"
                        intent="danger"
                        aria-label={`Esquecer ${skill.name}`}
                        onClick={() => onApply(forgetSkill(character, skill.name))}
                      >
                        ESQUECER
                      </Button>
                    ) : null}
                  </div>
                }
              />
            ))}
          </ul>
        )}
      </section>

      {/* Aprender só aparece editando, e abre uma gaveta: a lista de cartas é
          consulta de um momento, não parte da tela. */}
      {isEditing ? (
        <>
          <Button
            className={styles.learnButton}
            variant="outline"
            disabled={!hasDomains}
            onClick={() => setIsLearning(true)}
          >
            + APRENDER CARTA
          </Button>

          {hasDomains ? null : (
            <p className={styles.empty}>
              As cartas vêm dos domínios da classe. Escolha a classe em Combate.
            </p>
          )}
        </>
      ) : null}

      <LearnDrawer
        isOpen={isLearning}
        character={character}
        derived={derived}
        onApply={onApply}
        onClose={() => setIsLearning(false)}
      />
    </div>
  )
}
