import { SectionLabel } from "@jposawa/ronin-ui"
import clsx from "clsx"
import type React from "react"

import { domainColorToken } from "@/helpers"
import { useCompendium } from "@/hooks"
import { subclassUpgradesOf, tokenPoolKey } from "@/rules"
import type { BaseComponent, Character } from "@/types"

import { ClassSummary } from "./ClassSummary"
import { OriginFeatures } from "./OriginFeatures"
import { SubclassTiers } from "./SubclassTiers"

import styles from "./Identity.module.css"

type IdentityFeaturesProps = BaseComponent & {
  character: Character
  /** Contador de tokens pela chave da fonte. Sem ele, só o texto. */
  renderTokens?: (key: string) => React.ReactNode
}

/**
 * O que classe, subclasse, espécie e origem **fazem**, na ficha em mesa.
 *
 * O nome sozinho, na faixa de identidade, obrigava a abrir o compêndio para
 * lembrar a feature no meio da cena. Aqui fica o texto, e a subclasse mostra
 * as três cartas com as ainda não obtidas apagadas — dá para ver o que vem.
 */
export const IdentityFeatures = ({
  character,
  renderTokens,
  className,
  style,
}: IdentityFeaturesProps) => {
  const { compendium } = useCompendium()

  const classDefinition = compendium.classes.find(
    (candidate) => candidate.name === character.className,
  )
  const subclass = compendium.subclasses.find(
    (candidate) =>
      candidate.name === character.subclass && candidate.className === character.className,
  )
  const ancestry = compendium.ancestries.find((candidate) => candidate.name === character.ancestry)
  const community = compendium.communities.find(
    (candidate) => candidate.name === character.community,
  )

  const hasAny = Boolean(classDefinition ?? subclass ?? ancestry ?? community)
  const classStripe = classDefinition
    ? ({
        "--domain-color": domainColorToken(classDefinition.domains[0]),
      } as React.CSSProperties)
    : undefined

  return (
    <section
      className={clsx(styles.identityFeatures, className)}
      style={style}
      aria-label="Features"
    >
      <SectionLabel>
        <h3>FEATURES</h3>
      </SectionLabel>

      {hasAny ? (
        <ul className={styles.featureGrid}>
          {classDefinition ? (
            <li className={styles.featureCard} style={classStripe}>
              <article className={styles.featureCardBody}>
                <hgroup className={styles.optionTitle}>
                  <h4 className={styles.optionName}>{classDefinition.name}</h4>
                  <p className={styles.optionMeta}>CLASSE</p>
                </hgroup>
                <ClassSummary
                  classDefinition={classDefinition}
                  renderTokens={(featureName) =>
                    renderTokens?.(tokenPoolKey("class", classDefinition.name, featureName))
                  }
                />
              </article>
            </li>
          ) : null}

          {subclass ? (
            <li className={styles.featureCard} style={classStripe}>
              <article className={styles.featureCardBody}>
                <hgroup className={styles.optionTitle}>
                  <h4 className={styles.optionName}>{subclass.name}</h4>
                  <p className={styles.optionMeta}>
                    SUBCLASSE
                    {subclass.spellcastTrait ? ` · FORCEWIELDING ${subclass.spellcastTrait}` : null}
                  </p>
                </hgroup>
                <SubclassTiers
                  subclass={subclass}
                  upgrades={subclassUpgradesOf(character)}
                  renderTokens={(featureName) =>
                    renderTokens?.(tokenPoolKey("subclass", subclass.name, featureName))
                  }
                />
              </article>
            </li>
          ) : null}

          {ancestry ? (
            <li className={styles.featureCard}>
              <article className={styles.featureCardBody}>
                <hgroup className={styles.optionTitle}>
                  <h4 className={styles.optionName}>{ancestry.name}</h4>
                  <p className={styles.optionMeta}>ESPÉCIE</p>
                </hgroup>
                <OriginFeatures features={ancestry.features} />
              </article>
            </li>
          ) : null}

          {community ? (
            <li className={styles.featureCard}>
              <article className={styles.featureCardBody}>
                <hgroup className={styles.optionTitle}>
                  <h4 className={styles.optionName}>{community.name}</h4>
                  <p className={styles.optionMeta}>ORIGEM</p>
                </hgroup>
                <OriginFeatures features={[community.feature]} />
              </article>
            </li>
          ) : null}
        </ul>
      ) : (
        <p className={styles.empty}>
          Nem classe, nem espécie, nem origem. Escolha em Editar ficha.
        </p>
      )}
    </section>
  )
}
