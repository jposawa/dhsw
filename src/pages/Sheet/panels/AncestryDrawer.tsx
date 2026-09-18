import { Button } from "@jposawa/ronin-ui"
import React from "react"

import { Switch } from "@/components"
import { WideDrawer } from "@/fragments"
import { featureNameOf } from "@/helpers"
import { useCompendium } from "@/hooks"

import { OriginFeatures } from "./OriginFeatures"

import styles from "./Identity.module.css"

type Heritage = {
  /** A espécie que dá a primeira feature. */
  ancestry: string | null
  /** A que dá a segunda. `null` é espécie única. */
  mixedAncestry: string | null
}

type AncestryDrawerProps = Heritage & {
  isOpen: boolean
  onChange: (next: Heritage) => void
  onClose: () => void
}

/**
 * Escolher a espécie — e, no mesmo lugar, a ascendência mista.
 *
 * Mista não é uma espécie a mais: é **escolher features**. A primeira vem de
 * uma espécie e a segunda de outra, nunca as duas da mesma (Core Rulebook,
 * p. 70–71). Por isso o interruptor fica aqui dentro e, ligado, cada espécie
 * passa a oferecer duas escolhas nomeadas pela feature que ela dá em cada
 * posição — em vez de um segundo campo na ficha, que não dizia qual feature
 * entrava de onde.
 *
 * Com a mista ligada a gaveta não fecha na escolha: são duas decisões.
 */
export const AncestryDrawer = ({
  isOpen,
  ancestry,
  mixedAncestry,
  onChange,
  onClose,
}: AncestryDrawerProps) => {
  const { compendium } = useCompendium()
  // Começa no estado da ficha. Quem abre a gaveta troca a `key`, então abrir
  // de novo recomeça daqui — sem efeito sincronizando estado com prop.
  const [isMixed, setIsMixed] = React.useState(mixedAncestry !== null)

  const chooseSingle = (name: string) => {
    onChange({ ancestry: name, mixedAncestry: null })
    onClose()
  }

  const chooseFirst = (name: string) => {
    onChange({ ancestry: name, mixedAncestry: mixedAncestry === name ? null : mixedAncestry })
  }

  const chooseSecond = (name: string) => {
    onChange({ ancestry: ancestry === name ? null : ancestry, mixedAncestry: name })
  }

  const toggleMixed = () => {
    if (isMixed) {
      onChange({ ancestry, mixedAncestry: null })
    }

    setIsMixed(!isMixed)
  }

  return (
    <WideDrawer
      isOpen={isOpen}
      title="Escolher espécie"
      onClose={onClose}
      footer={isMixed ? <Button onClick={onClose}>PRONTO</Button> : undefined}
    >
      <section className={styles.drawerBody} aria-label="Espécies">
        <Switch className={styles.mixedSwitch} isOn={isMixed} onToggle={toggleMixed}>
          <span className={styles.mixedText}>
            ASCENDÊNCIA MISTA
            <span className={styles.mixedNote}>
              A 1ª feature vem de uma espécie e a 2ª de outra.
            </span>
          </span>
        </Switch>

        <ul className={styles.options}>
          {compendium.ancestries.map((option) => {
            const isFirst = option.name === ancestry
            const isSecond = option.name === mixedAncestry
            const firstName = featureNameOf(option.features[0] ?? "") ?? "1ª feature"
            const secondName = featureNameOf(option.features[1] ?? "") ?? "2ª feature"

            return (
              <li
                className={styles.option}
                key={option.name}
                data-current={isFirst || isSecond || undefined}
              >
                <article className={styles.optionBody}>
                  <header className={styles.optionHead}>
                    <hgroup className={styles.optionTitle}>
                      <h4 className={styles.optionName}>{option.name}</h4>
                      {isMixed && (isFirst || isSecond) ? (
                        <p className={styles.optionMeta}>
                          {isFirst ? "1ª FEATURE DAQUI" : "2ª FEATURE DAQUI"}
                        </p>
                      ) : null}
                    </hgroup>

                    {isMixed ? (
                      <div className={styles.optionActions}>
                        <Button
                          variant="outline"
                          disabled={isFirst}
                          aria-label={`Usar ${firstName}, de ${option.name}, como primeira feature`}
                          onClick={() => chooseFirst(option.name)}
                        >
                          1ª · {firstName}
                        </Button>
                        <Button
                          variant="outline"
                          disabled={isSecond}
                          aria-label={`Usar ${secondName}, de ${option.name}, como segunda feature`}
                          onClick={() => chooseSecond(option.name)}
                        >
                          2ª · {secondName}
                        </Button>
                      </div>
                    ) : isFirst ? (
                      <span className={styles.currentTag}>ATUAL</span>
                    ) : (
                      <Button
                        variant="outline"
                        aria-label={`Escolher ${option.name}`}
                        onClick={() => chooseSingle(option.name)}
                      >
                        ESCOLHER
                      </Button>
                    )}
                  </header>

                  <OriginFeatures
                    description={option.description}
                    features={option.features}
                    // Na mista, dizer qual posição cada feature ocupa é o que
                    // deixa a escolha explícita.
                    sources={isMixed ? ["1ª FEATURE", "2ª FEATURE"] : undefined}
                  />
                </article>
              </li>
            )
          })}
        </ul>
      </section>
    </WideDrawer>
  )
}
