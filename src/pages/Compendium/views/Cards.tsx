import { Chip, Collapse, Input, SectionLabel } from "@jposawa/ronin-ui"
import { useAtom } from "jotai"
import React from "react"

import { DomainLabel } from "@/components"
import { DOMAIN_LIST } from "@/constants"
import { RuleText, SkillCard, SkillDetail } from "@/fragments"
import { domainColorToken } from "@/helpers"
import { useSkillSearch } from "@/hooks"
import { compendiumViewAtom, openSkillsAtom } from "@/states"
import type { Domain, Skill } from "@/types"

import styles from "./Cards.module.css"

/**
 * As 126 cartas de domínio. Vêm de módulo estático — sem fetch, sem estado de
 * carregamento, sem modo offline para resolver problema que não existe. O
 * índice de busca é pré-computado no build.
 *
 * **Dois modos de ver, um só conjunto de filtros.** A busca e os chips ficam
 * acima do alternador e valem para os dois: filtrar e depois trocar de modo é
 * o gesto normal, e refazer o filtro a cada troca seria trabalho inventado.
 *
 * **O modo governa a apresentação dos itens, e só isso.** A largura da tela é
 * a mesma nos dois — quem decide a medida é a página, não o alternador. Largura
 * que muda ao trocar de modo faz a régua de segmentos e a busca escorregarem
 * debaixo do dedo, e o alternador passa a parecer um controle de zoom.
 */
export const CompendiumCards = () => {
  const [query, setQuery] = React.useState("")
  const [domains, setDomains] = React.useState<ReadonlySet<Domain>>(new Set())
  // Atom, e não estado local: sair para uma classe e voltar não deve fechar o
  // que estava aberto. É estado de sessão, e some ao recarregar de propósito.
  const [openSkills, setOpenSkills] = useAtom(openSkillsAtom)
  const [view, setView] = useAtom(compendiumViewAtom)
  const [openedSkill, setOpenedSkill] = React.useState<Skill | null>(null)

  const skills = useSkillSearch(query, domains)

  const toggleDomain = (domain: Domain) => {
    const next = new Set(domains)

    if (next.has(domain)) {
      next.delete(domain)
    } else {
      next.add(domain)
    }

    setDomains(next)
  }

  const toggleSkill = (skillName: string) => {
    const next = new Set(openSkills)

    if (next.has(skillName)) {
      next.delete(skillName)
    } else {
      next.add(skillName)
    }

    setOpenSkills(next)
  }

  return (
    <>
      <search className={styles.controls}>
        <Input
          type="search"
          value={query}
          placeholder="Buscar carta ou efeito"
          aria-label="Buscar carta ou efeito"
          autoComplete="off"
          onValueChange={setQuery}
        />

        <div className={styles.chips}>
          {DOMAIN_LIST.map((domain) => (
            <Chip
              key={domain}
              label={domain}
              isActive={domains.has(domain)}
              color={domainColorToken(domain)}
              onToggle={() => toggleDomain(domain)}
            />
          ))}
        </div>

        <div className={styles.toolbar}>
          <SectionLabel>{skills.length} de 126</SectionLabel>

          {/* `radiogroup`, e não dois botões soltos: os modos são exclusivos, e
              é isso que faz o leitor anunciar "1 de 2" em vez de dois estados
              que por acaso nunca ligam juntos. */}
          <div className={styles.viewToggle} role="radiogroup" aria-label="Modo de exibição">
            {(
              [
                ["list", "Lista"],
                ["grid", "Cartas"],
              ] as const
            ).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={view === mode}
                className={styles.viewOption}
                data-testid={`compendium-view-${mode}`}
                onClick={() => setView(mode)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </search>

      {skills.length === 0 ? (
        <p className={styles.empty}>Nada encontrado para “{query}”.</p>
      ) : view === "grid" ? (
        <ul className={styles.grid} data-testid="compendium-grid">
          {skills.map((skill) => (
            <li className={styles.gridItem} key={skill.name}>
              <SkillCard skill={skill} onOpen={() => setOpenedSkill(skill)} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className={styles.list} data-testid="compendium-list">
          {skills.map((skill) => (
            <li
              key={skill.name}
              className={styles.row}
              style={
                { "--domain-color": domainColorToken(skill.domain) } as React.CSSProperties
              }
            >
              {/* Collapse, e não um <button> com o corpo dentro: o texto da
                  carta vira <p> e <ul>, que um botão não pode conter — o
                  markup seria inválido e a carta inteira viraria nome
                  acessível do controle. */}
              <Collapse
                className={styles.rowCollapse}
                isOpen={openSkills.has(skill.name)}
                onToggle={() => toggleSkill(skill.name)}
                title={<h3 className={styles.rowName}>{skill.name}</h3>}
                detail={
                  <span className={styles.rowMeta}>
                    <DomainLabel domain={skill.domain} level={skill.level} />
                    <span className={styles.rowRecall}>◦{skill.recallCost}</span>
                  </span>
                }
              >
                <RuleText className={styles.rowText} text={skill.text} />
              </Collapse>
            </li>
          ))}
        </ul>
      )}

      <SkillDetail skill={openedSkill} onClose={() => setOpenedSkill(null)} />
    </>
  )
}
