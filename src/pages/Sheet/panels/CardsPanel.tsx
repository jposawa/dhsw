import { Button, SectionLabel } from "@jposawa/ronin-ui"
import React from "react"

import { activeTokenPools, domainAccessFor, moveToVault, setTokenCount, tokenCount } from "@/helpers"
import { useCompendium } from "@/hooks"
import type { Character, DerivedStats, Result, Skill } from "@/types"

import { LearnDrawer } from "./LearnDrawer"
import { SkillRow } from "./SkillRow"
import { TokenCounter } from "./TokenCounter"
import { VaultDrawer } from "./VaultDrawer"

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
  const [isVaultOpen, setIsVaultOpen] = React.useState(false)

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

      {/* As duas listas que não são o loadout abrem gaveta: o vault cresce sem
          teto e o acervo é uma tela inteira de resultados. Em cima da tela,
          elas roubavam espaço das cartas que estão em jogo. */}
      <menu className={styles.actions}>
        <Button variant="outline" onClick={() => setIsVaultOpen(true)}>
          VAULT &nbsp;{vault.length}
        </Button>

        {/* Aprender só aparece editando: é progressão, não jogada. */}
        {isEditing ? (
          <Button variant="outline" disabled={!hasDomains} onClick={() => setIsLearning(true)}>
            + &nbsp;APRENDER CARTA
          </Button>
        ) : null}
      </menu>

      {isEditing && !hasDomains ? (
        <p className={styles.empty}>
          As cartas vêm dos domínios da classe. Escolha a classe em Geral.
        </p>
      ) : null}

      <VaultDrawer
        isOpen={isVaultOpen}
        character={character}
        derived={derived}
        vault={vault}
        isEditing={isEditing}
        isFreeSwap={isFreeSwap}
        onToggleFreeSwap={() => setIsFreeSwap(!isFreeSwap)}
        onApply={onApply}
        onClose={() => setIsVaultOpen(false)}
      />

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
