import React from 'react'

import { SKILLS, SKILL_SEARCH_INDEX } from '@/compendium'
import { filterByIndex } from '@/helpers'
import type { Domain, Skill } from '@/types'

/** Busca nas 126 cartas contra o indice pre-computado, com filtro de dominio. */
export const useSkillSearch = (query: string, domains: ReadonlySet<Domain>): Skill[] =>
  React.useMemo(() => {
    const matches = filterByIndex(SKILLS, (skill) => skill.name, SKILL_SEARCH_INDEX, query)

    if (domains.size === 0) {
      return matches
    }

    return matches.filter((skill) => domains.has(skill.domain))
  }, [query, domains])
