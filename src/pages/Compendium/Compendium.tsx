import React from 'react'

import { Chip, Collapse, Input, SectionLabel, StepRule } from '@/components'
import { DOMAIN_LIST } from '@/constants'
import { SkillText } from '@/fragments'
import { domainColorToken } from '@/helpers'
import { useSkillSearch } from '@/hooks'
import type { Domain } from '@/types'

import styles from './Compendium.module.css'

/**
 * Busca no compêndio. As 126 cartas vêm de módulo estático — sem fetch, sem
 * estado de carregamento, sem modo offline para resolver problema que não
 * existe. O índice de busca é pré-computado no build.
 */
export const Compendium = () => {
  const [query, setQuery] = React.useState('')
  const [domains, setDomains] = React.useState<ReadonlySet<Domain>>(new Set())
  const [openSkills, setOpenSkills] = React.useState<ReadonlySet<string>>(new Set())

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
    <main className={styles.page}>
      <StepRule />

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

      <SectionLabel>{skills.length} de 126</SectionLabel>

      {skills.length === 0 ? (
        <p className={styles.empty}>Nada encontrado para “{query}”.</p>
      ) : (
        <ul className={styles.list}>
          {skills.map((skill) => (
            <li
              key={skill.name}
              className={styles.row}
              style={
                { '--domain-color': domainColorToken(skill.domain) } as React.CSSProperties
              }
            >
              {/* Collapse, e não um <button> com o corpo dentro: o texto da
                  carta vira <p> e <ul>, que um botão não pode conter — o
                  markup era inválido e a carta inteira virava nome acessível
                  do controle. Aqui o corpo é irmão do gatilho, numa região
                  ligada por aria-controls. */}
              <Collapse
                className={styles.card}
                isOpen={openSkills.has(skill.name)}
                onToggle={() => toggleSkill(skill.name)}
                title={<span className={styles.rowName}>{skill.name}</span>}
                detail={
                  <span className={styles.rowMeta}>
                    <span className={styles.rowLevel}>
                      {skill.domain.toUpperCase()} {skill.level}
                    </span>
                    <span className={styles.rowRecall}>◦{skill.recallCost}</span>
                  </span>
                }
              >
                <SkillText text={skill.text} />
              </Collapse>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
