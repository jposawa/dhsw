import { Button, Drawer, Input, SectionLabel } from "@jposawa/ronin-ui"
import React from "react"

import { SkillCardGrid } from "@/fragments"
import { useCompendium, useSkillSearch } from "@/hooks"
import { isKnown, learnableSkills, learnSkill } from "@/rules"
import type { Character, DerivedStats, Domain, Result } from "@/types"

import styles from "./CardsPanel.module.css"

const ALL_DOMAINS: ReadonlySet<Domain> = new Set()

type LearnDrawerProps = {
  isOpen: boolean
  character: Character
  derived: DerivedStats
  onApply: (result: Result<Character>) => void
  onClose: () => void
}

/**
 * Aprender carta: só as que o personagem alcança, em formato de carta.
 *
 * A lista vem de `learnableSkills` — domínios da classe até o nível dele, e o
 * domínio de multiclasse até metade do nível. A tela não filtra nada por conta
 * própria; a busca só estreita o que a regra já liberou.
 */
export const LearnDrawer = ({ isOpen, character, derived, onApply, onClose }: LearnDrawerProps) => {
  const { compendium } = useCompendium()
  const [query, setQuery] = React.useState("")

  const found = useSkillSearch(query, ALL_DOMAINS)
  const learnable = new Set(learnableSkills(character, compendium).map((skill) => skill.name))
  const shown = found.filter((skill) => learnable.has(skill.name))

  const handleClose = () => {
    setQuery("")
    onClose()
  }

  return (
    <Drawer isOpen={isOpen} title="Aprender carta" onClose={handleClose}>
      <section className={styles.learn} aria-label="Cartas que dá para aprender">
        <SectionLabel detail={`${derived.expectedCards} esperadas no nível ${derived.level}`}>
          <h3>{shown.length} CARTAS AO ALCANCE</h3>
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

        {shown.length === 0 ? (
          <p className={styles.empty}>Nenhuma carta ao alcance com essa busca.</p>
        ) : (
          <SkillCardGrid
            className={styles.learnGrid}
            skills={shown}
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
    </Drawer>
  )
}
