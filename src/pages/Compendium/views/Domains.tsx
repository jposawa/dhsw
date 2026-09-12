import { Input, SectionLabel } from "@jposawa/ronin-ui"
import React from "react"

import { DOMAIN_DEFINITIONS, SKILLS } from "@/compendium"
import { DomainSymbol } from "@/components"
import { DOMAIN_LIST } from "@/constants"
import { domainColorToken, filterByText } from "@/helpers"

import styles from "./Reference.module.css"

/**
 * Os seis domínios: o que cada um cobre, e quantas cartas tem.
 *
 * A contagem sai de `SKILLS`, não de número escrito à mão: carta que troque de
 * domínio corrige o total sozinha, e um número datilografado envelheceria
 * calado.
 */
export const CompendiumDomains = () => {
  const [query, setQuery] = React.useState("")

  const countByDomain = React.useMemo(() => {
    const counts = new Map(DOMAIN_LIST.map((domain) => [domain, 0]))

    for (const skill of SKILLS) {
      counts.set(skill.domain, (counts.get(skill.domain) ?? 0) + 1)
    }

    return counts
  }, [])

  const domains = filterByText(
    DOMAIN_DEFINITIONS,
    (domain) => `${domain.name} ${domain.description}`,
    query,
  )

  return (
    <>
      <search className={styles.controls}>
        <Input
          type="search"
          value={query}
          placeholder="Buscar domínio"
          aria-label="Buscar domínio"
          autoComplete="off"
          onValueChange={setQuery}
        />

        <SectionLabel detail={`${domains.length} de ${DOMAIN_DEFINITIONS.length}`}>
          <h2>DOMÍNIOS</h2>
        </SectionLabel>
      </search>

      {domains.length === 0 ? (
        <p className={styles.empty}>Nada encontrado para “{query}”.</p>
      ) : (
        <ul className={styles.list}>
          {domains.map((domain) => (
            <li
              key={domain.name}
              className={styles.item}
              style={
                { "--domain-color": domainColorToken(domain.name) } as React.CSSProperties
              }
            >
              <article className={styles.entry}>
                <header className={styles.head}>
                  <DomainSymbol className={styles.symbol} domain={domain.name} />
                  <hgroup className={styles.headText}>
                    <h3 className={styles.name}>{domain.name}</h3>
                    <p className={styles.meta}>{countByDomain.get(domain.name)} cartas</p>
                  </hgroup>
                </header>

                <p className={styles.body}>{domain.description}</p>
              </article>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
