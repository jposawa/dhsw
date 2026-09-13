import { Button, Chip, Input, SectionLabel } from "@jposawa/ronin-ui"
import React from "react"

import { SkillCardGrid } from "@/fragments"
import { useCompendium, useSkillSearch } from "@/hooks"
import { forgetSkill, isKnown, learnSkill, moveToLoadout, moveToVault } from "@/rules"
import type { Character, DerivedStats, Domain, Result, Skill } from "@/types"

import { SkillRow } from "./SkillRow"

import styles from "./CardsPanel.module.css"

/**
 * Quantas cartas a busca mostra de uma vez.
 *
 * Sem corte, uma busca vazia despeja as 42 cartas dos dois domínios da classe
 * e a lista de baixo some da tela. Quem procura uma carta específica digita.
 */
const LEARNABLE_SHOWN = 12

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
  const [query, setQuery] = React.useState("")

  /**
   * A busca do acervo nasce filtrada pelos domínios da classe.
   *
   * Sem classe escolhida, mostra os seis: é o caso de quem ainda está montando
   * a ficha, e esconder tudo ali seria uma tela vazia sem explicação.
   */
  const classDomains = character.className
    ? compendium.classes.find((candidate) => candidate.name === character.className)?.domains
    : undefined
  const searchDomains = React.useMemo(
    () => new Set<Domain>(classDomains ?? []),
    [classDomains],
  )

  const found = useSkillSearch(query, searchDomains)

  const skillsOf = (names: readonly string[]): Skill[] =>
    names
      .map((name) => compendium.skills.find((candidate) => candidate.name === name))
      .filter((skill): skill is Skill => skill !== undefined)

  const loadout = skillsOf(character.loadout)
  const vault = skillsOf(character.vault)

  return (
    <div className={styles.layout}>
      <section className={styles.loadout}>
        <SectionLabel detail={`${loadout.length}/${derived.loadoutMax.total}`}>
          <h3>LOADOUT</h3>
        </SectionLabel>

        {/* A troca livre é estado da mesa, não da ficha: vale enquanto durar o
            descanso e não sobrevive ao recarregar. Guardá-la na ficha faria
            alguém voltar no dia seguinte ainda em descanso. */}
        <div className={styles.restSwitch}>
          <Chip
            label="Troca livre (descanso)"
            isActive={isFreeSwap}
            onToggle={() => setIsFreeSwap(!isFreeSwap)}
          />
          <p className={styles.hint}>
            {isFreeSwap
              ? "Trazer carta do vault não custa Stress."
              : "Trazer carta do vault custa Stress igual ao Recall Cost."}
          </p>
        </div>

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
              />
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

      {isEditing ? (
        <section className={styles.learn}>
          <SectionLabel detail={`${derived.expectedCards} esperadas no nível ${derived.level}`}>
            <h3>APRENDER CARTA</h3>
          </SectionLabel>

          <search>
            <Input
              type="search"
              value={query}
              placeholder="Buscar carta ou efeito"
              aria-label="Buscar carta para aprender"
              autoComplete="off"
              onValueChange={setQuery}
            />
          </search>

          {found.length === 0 ? (
            <p className={styles.empty}>Nada encontrado para “{query}”.</p>
          ) : (
            <SkillCardGrid
              skills={found.slice(0, LEARNABLE_SHOWN)}
              actionFor={(skill) =>
                isKnown(character, skill.name) ? (
                  <span className={styles.known}>JÁ SABE</span>
                ) : (
                  <Button
                    variant="outline"
                    aria-label={`Aprender ${skill.name}`}
                    onClick={() => onApply(learnSkill(character, skill.name, compendium))}
                  >
                    APRENDER
                  </Button>
                )
              }
            />
          )}
        </section>
      ) : null}
    </div>
  )
}
