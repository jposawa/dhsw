import { Input, SectionLabel } from "@jposawa/ronin-ui"
import React from "react"

import { ANCESTRIES } from "@/compendium"
import { filterByText } from "@/helpers"

import styles from "./Reference.module.css"

/**
 * As oito espécies.
 *
 * Cada uma traz duas features, por padrão do SRD — a assimetria com origem,
 * que traz uma só, está registrada em `types/compendium.ts` e não é engano.
 */
export const CompendiumAncestries = () => {
  const [query, setQuery] = React.useState("")

  const ancestries = filterByText(
    ANCESTRIES,
    (ancestry) => `${ancestry.name} ${ancestry.description} ${ancestry.features.join(" ")}`,
    query,
  )

  return (
    <>
      <search className={styles.controls}>
        <Input
          type="search"
          value={query}
          placeholder="Buscar espécie"
          aria-label="Buscar espécie"
          autoComplete="off"
          onValueChange={setQuery}
        />

        <SectionLabel detail={`${ancestries.length} de ${ANCESTRIES.length}`}>
          <h2>ESPÉCIES</h2>
        </SectionLabel>
      </search>

      {ancestries.length === 0 ? (
        <p className={styles.empty}>Nada encontrado para “{query}”.</p>
      ) : (
        <ul className={styles.list}>
          {ancestries.map((ancestry) => (
            <li key={ancestry.name} className={styles.item}>
              <article className={styles.entry}>
                <h3 className={styles.name}>{ancestry.name}</h3>

                <p className={styles.body}>{ancestry.description}</p>

                <ul className={styles.featureList}>
                  {ancestry.features.map((feature) => (
                    <li key={feature} className={styles.feature}>
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
