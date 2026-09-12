import { Chip, Input, SectionLabel } from "@jposawa/ronin-ui"
import React from "react"

import { GEAR_KINDS } from "@/constants"
import { RuleText } from "@/fragments"
import { filterByText, formatSigned } from "@/helpers"
import { useCompendium } from "@/hooks"
import type { GearKind } from "@/types"

import styles from "./Reference.module.css"

/**
 * Armas, armaduras, itens e consumíveis.
 *
 * **Os quatro dividem um segmento, mas não uma tabela.** Arma tem alcance,
 * dado de dano e ônus; armadura tem linha e limiares; item e consumível têm só
 * nível e texto. Espremer as quatro formas numa lista só encheria de coluna
 * vazia — então os chips trocam a tabela inteira, e cada tipo mostra o que
 * ele de fato tem.
 *
 * Chip, e não uma segunda régua de segmentos: aqui não é navegação, é filtro
 * dentro de uma tela — e o compêndio já tem uma régua acima, que confundiria.
 */
export const CompendiumGear = () => {
  const { compendium } = useCompendium()

  const [kind, setKind] = React.useState<GearKind>("armas")
  const [query, setQuery] = React.useState("")

  const weapons = filterByText(
    compendium.weapons,
    (weapon) => `${weapon.name} ${weapon.trait} ${weapon.range} ${weapon.feature ?? ""}`,
    query,
  )
  const armor = filterByText(
    compendium.namedArmor,
    (piece) => `${piece.name} ${piece.line} ${piece.feature ?? ""}`,
    query,
  )
  const items = filterByText(compendium.items, (item) => `${item.name} ${item.text}`, query)
  const consumables = filterByText(compendium.consumables, (item) => `${item.name} ${item.text}`, query)

  const shownByKind = {
    armas: weapons,
    armaduras: armor,
    itens: items,
    consumiveis: consumables,
  }
  const totalByKind = {
    armas: compendium.weapons,
    armaduras: compendium.namedArmor,
    itens: compendium.items,
    consumiveis: compendium.consumables,
  }

  const shown = shownByKind[kind]
  const kindLabel = GEAR_KINDS.find((option) => option.id === kind)?.label ?? ""
  const entries = kind === "consumiveis" ? consumables : items

  return (
    <>
      <search className={styles.controls}>
        <Input
          type="search"
          value={query}
          placeholder="Buscar equipamento"
          aria-label="Buscar equipamento"
          autoComplete="off"
          onValueChange={setQuery}
        />

        <div className={styles.chips}>
          {GEAR_KINDS.map((option) => (
            <Chip
              key={option.id}
              label={option.label}
              isActive={kind === option.id}
              onToggle={() => setKind(option.id)}
            />
          ))}
        </div>

        <SectionLabel detail={`${shown.length} de ${totalByKind[kind].length}`}>
          <h2>{kindLabel.toUpperCase()}</h2>
        </SectionLabel>
      </search>

      {shown.length === 0 ? <p className={styles.empty}>Nada encontrado para “{query}”.</p> : null}

      {kind === "armas" && weapons.length > 0 ? (
        <ul className={styles.list}>
          {weapons.map((weapon) => (
            <li key={weapon.name} className={styles.item}>
              <article className={styles.entry}>
                <header className={styles.head}>
                  <hgroup className={styles.headText}>
                    <h3 className={styles.name}>
                      {weapon.name}
                      {weapon.isIconic ? <span className={styles.iconic}> ◆</span> : null}
                    </h3>
                    <p className={styles.meta}>
                      {weapon.trait} · {weapon.range} · {weapon.burden}
                    </p>
                  </hgroup>
                  <span className={styles.value}>
                    {weapon.damageDie}
                    <span className={styles.unit}>{weapon.damageType}</span>
                  </span>
                </header>

                <p className={styles.tiers}>
                  {weapon.bonusByTier.map((bonus, tierIndex) => (
                    <span key={tierIndex} className={styles.tier}>
                      T{tierIndex + 1} {formatSigned(bonus)}
                    </span>
                  ))}
                </p>

                {weapon.feature ? (
                  <RuleText className={styles.body} text={weapon.feature} />
                ) : null}
              </article>
            </li>
          ))}
        </ul>
      ) : null}

      {kind === "armaduras" && armor.length > 0 ? (
        <ul className={styles.list}>
          {armor.map((piece) => (
            <li key={piece.name} className={styles.item}>
              <article className={styles.entry}>
                <header className={styles.head}>
                  <hgroup className={styles.headText}>
                    <h3 className={styles.name}>{piece.name}</h3>
                    <p className={styles.meta}>
                      {piece.line} · Tier {piece.tier}
                    </p>
                  </hgroup>
                </header>

                {piece.feature ? (
                  <RuleText className={styles.body} text={piece.feature} />
                ) : null}
              </article>
            </li>
          ))}
        </ul>
      ) : null}

      {(kind === "itens" || kind === "consumiveis") && entries.length > 0 ? (
        <ul className={styles.list}>
          {entries.map((entry) => (
            <li key={entry.name} className={styles.item}>
              <article className={styles.entry}>
                <header className={styles.head}>
                  <hgroup className={styles.headText}>
                    <h3 className={styles.name}>{entry.name}</h3>
                    <p className={styles.meta}>Tier {entry.tier}</p>
                  </hgroup>
                </header>

                <RuleText className={styles.body} text={entry.text} />
              </article>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  )
}
