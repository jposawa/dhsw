import { Collapse, Input, SectionLabel } from "@jposawa/ronin-ui"
import React from "react"

import { CLASSES, SUBCLASSES } from "@/compendium"
import { DomainLabel } from "@/components"
import { RuleText } from "@/fragments"
import { domainColorToken, filterByText } from "@/helpers"

import styles from "./Reference.module.css"

/**
 * As seis classes, com as subclasses de cada uma dentro.
 *
 * As subclasses moram aqui, e não num segmento próprio: uma subclasse não se
 * escolhe sozinha — ela pertence a uma classe, e vê-la fora dela obrigaria a
 * lembrar a que classe pertence. Doze itens também não sustentariam um
 * segmento.
 */
export const CompendiumClasses = () => {
  const [query, setQuery] = React.useState("")
  const [openClasses, setOpenClasses] = React.useState<ReadonlySet<string>>(new Set())

  const classes = filterByText(
    CLASSES,
    (klass) => `${klass.name} ${klass.baseFeatures} ${klass.hopeFeature}`,
    query,
  )

  const toggleClass = (className: string) => {
    const next = new Set(openClasses)

    if (next.has(className)) {
      next.delete(className)
    } else {
      next.add(className)
    }

    setOpenClasses(next)
  }

  return (
    <>
      <search className={styles.controls}>
        <Input
          type="search"
          value={query}
          placeholder="Buscar classe ou feature"
          aria-label="Buscar classe ou feature"
          autoComplete="off"
          onValueChange={setQuery}
        />

        <SectionLabel detail={`${classes.length} de ${CLASSES.length}`}>
          <h2>CLASSES</h2>
        </SectionLabel>
      </search>

      {classes.length === 0 ? (
        <p className={styles.empty}>Nada encontrado para “{query}”.</p>
      ) : (
        <ul className={styles.list}>
          {classes.map((klass) => (
            <li
              key={klass.name}
              className={styles.item}
              style={
                { "--domain-color": domainColorToken(klass.domains[0]) } as React.CSSProperties
              }
            >
              <Collapse
                className={styles.collapse}
                isOpen={openClasses.has(klass.name)}
                onToggle={() => toggleClass(klass.name)}
                title={<h3 className={styles.name}>{klass.name}</h3>}
                detail={
                  <span className={styles.domains}>
                    {klass.domains.map((domain) => (
                      <DomainLabel key={domain} domain={domain} />
                    ))}
                  </span>
                }
              >
                <dl className={styles.stats}>
                  <div className={styles.stat}>
                    <dt>EVASION</dt>
                    <dd>{klass.evasion}</dd>
                  </div>
                  <div className={styles.stat}>
                    <dt>HIT POINTS</dt>
                    <dd>{klass.hitPoints}</dd>
                  </div>
                </dl>

                <h4 className={styles.label}>FEATURES</h4>
                <RuleText text={klass.baseFeatures} />

                <h4 className={styles.label}>HOPE</h4>
                <RuleText text={klass.hopeFeature} />

                <h4 className={styles.label}>SUBCLASSES</h4>
                <ul className={styles.subList}>
                  {SUBCLASSES.filter((subclass) => subclass.className === klass.name).map(
                    (subclass) => (
                      <li key={subclass.name} className={styles.subRow}>
                        <b className={styles.subName}>{subclass.name}</b>
                        <span className={styles.meta}>{subclass.spellcastTrait}</span>
                      </li>
                    ),
                  )}
                </ul>
              </Collapse>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
