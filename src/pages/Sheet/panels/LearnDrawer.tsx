import { Button, Input, SectionLabel } from "@jposawa/ronin-ui"
import React from "react"

import { WideDrawer } from "@/fragments"
import { useCompendium, useSkillSearch } from "@/hooks"
import { forgetSkill, isKnown, learnableSkills, learnSkill } from "@/rules"
import type { Character, DerivedStats, Domain, Result } from "@/types"

import { SkillRow } from "./SkillRow"

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
 *
 * A carta já sabida traz ESQUECER, e não um aviso de que já é sabida: a gaveta
 * é a lista do que o personagem pode saber, e tirar é a outra metade de pôr.
 * Sem confirmar antes — isto é modo edição, e o CANCELAR da barra já é o
 * desfazer; perguntar de novo pela mesma coisa é atrito por atrito.
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
    <WideDrawer isOpen={isOpen} title="Aprender carta" onClose={handleClose}>
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
          /* Lista, e não grade de cartas: aqui a pergunta é "o que esta carta
             faz", e o texto inteiro à vista responde. A grade é do compêndio,
             onde se procura pela arte e pelo nome. */
          <ul className={styles.list}>
            {shown.map((skill) => (
              <SkillRow
                key={skill.name}
                skill={skill}
                action={
                  isKnown(character, skill.name) ? (
                    <Button
                      variant="text"
                      intent="danger"
                      aria-label={`Esquecer ${skill.name}`}
                      onClick={() => onApply(forgetSkill(character, skill.name))}
                    >
                      ESQUECER
                    </Button>
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
            ))}
          </ul>
        )}
      </section>
    </WideDrawer>
  )
}
