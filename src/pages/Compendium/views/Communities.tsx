import { Input, SectionLabel } from "@jposawa/ronin-ui"
import React from "react"

import { COMMUNITIES } from "@/compendium"
import { RuleText } from "@/fragments"
import { filterByText } from "@/helpers"

import styles from "./Reference.module.css"

/** As seis origens. Uma feature cada, por padrão do SRD. */
export const CompendiumCommunities = () => {
  const [query, setQuery] = React.useState("")

  const communities = filterByText(
    COMMUNITIES,
    (community) => `${community.name} ${community.description} ${community.feature}`,
    query,
  )

  return (
    <>
      <search className={styles.controls}>
        <Input
          type="search"
          value={query}
          placeholder="Buscar origem"
          aria-label="Buscar origem"
          autoComplete="off"
          onValueChange={setQuery}
        />

        <SectionLabel detail={`${communities.length} de ${COMMUNITIES.length}`}>
          <h2>ORIGENS</h2>
        </SectionLabel>
      </search>

      {communities.length === 0 ? (
        <p className={styles.empty}>Nada encontrado para “{query}”.</p>
      ) : (
        <ul className={styles.list}>
          {communities.map((community) => (
            <li key={community.name} className={styles.item}>
              <article className={styles.entry}>
                <h3 className={styles.name}>{community.name}</h3>

                <RuleText className={styles.body} text={community.description} />

                <ul className={styles.featureList}>
                  <li className={styles.feature}>
                    <RuleText text={community.feature} />
                  </li>
                </ul>
              </article>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
