import React from "react"

import { filterByIndex, normalizeForSearch } from "@/helpers"
import type { Domain, Skill } from "@/types"

import { useCompendium } from "./useCompendium"

/**
 * Busca nas cartas, com filtro de domínio.
 *
 * O índice — nome, domínio e texto normalizados — é montado uma vez por
 * compêndio e não a cada tecla: normalizar o texto de todas as cartas a cada
 * letra digitada é o custo que ele evita.
 */
export const useSkillSearch = (query: string, domains: ReadonlySet<Domain>): Skill[] => {
  const { compendium } = useCompendium()

  const searchIndex = React.useMemo(
    () =>
      Object.fromEntries(
        compendium.skills.map((skill) => [
          skill.name,
          normalizeForSearch(`${skill.name} ${skill.domain} ${skill.text}`),
        ]),
      ),
    [compendium.skills],
  )

  return React.useMemo(() => {
    const matches = filterByIndex(compendium.skills, (skill) => skill.name, searchIndex, query)

    if (domains.size === 0) {
      return matches
    }

    return matches.filter((skill) => domains.has(skill.domain))
  }, [compendium.skills, searchIndex, query, domains])
}
