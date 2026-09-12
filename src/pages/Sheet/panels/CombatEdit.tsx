import { SectionLabel, Stepper } from "@jposawa/ronin-ui"

import { ANCESTRIES, CLASSES, COMMUNITIES, SUBCLASSES } from "@/compendium"
import { MAX_LEVEL, MIN_LEVEL, TRAIT_LIST } from "@/constants"
import { formatSigned } from "@/helpers"
import type { Character, DerivedStats } from "@/types"

import styles from "./CombatEdit.module.css"

type CombatEditProps = {
  draft: Character
  derived: DerivedStats
  onChange: (mutate: (current: Character) => Character) => void
}

/**
 * A oficina da ficha: só o que **define** os máximos.
 *
 * **Nada daqui é gravado sem Salvar.** O painel trabalha sobre um rascunho e o
 * roster só recebe a ficha quando o botão é apertado — trocar de classe sem
 * querer não pode reescrever a ficha da mesa inteira, e um campo de nome que
 * grava a cada tecla enche o histórico de versões pela metade de um nome.
 *
 * Os números derivados aparecem acima do formulário e acompanham o rascunho:
 * a pessoa vê Evasion e HP mudarem **antes** de confirmar, que é a única razão
 * de se estar nesta tela. Sem isso, escolher classe seria escolher às cegas.
 *
 * Marcador não aparece aqui de propósito — ele é estado de mesa, mora no modo
 * jogo e grava no toque.
 */
export const CombatEdit = ({ draft, derived, onChange }: CombatEditProps) => (
  <>
    <section className={styles.block}>
      <SectionLabel detail={`Tier ${derived.tier}`}>
        <h3>O QUE ISSO MUDA</h3>
      </SectionLabel>

      <dl className={styles.preview}>
        <div className={styles.previewCell}>
          <dt>EVASION</dt>
          <dd>{derived.evasion.total}</dd>
        </div>
        <div className={styles.previewCell}>
          <dt>HP MÁX</dt>
          <dd>{derived.hitPointsMax.total}</dd>
        </div>
        <div className={styles.previewCell}>
          <dt>STRESS MÁX</dt>
          <dd>{derived.stressMax.total}</dd>
        </div>
        <div className={styles.previewCell}>
          <dt>PROF</dt>
          <dd>{derived.proficiency.total}</dd>
        </div>
        <div className={styles.previewCell}>
          <dt>MAJOR</dt>
          <dd>{derived.majorThreshold.total}</dd>
        </div>
        <div className={styles.previewCell}>
          <dt>SEVERE</dt>
          <dd>{derived.severeThreshold.total}</dd>
        </div>
      </dl>
    </section>

    <section className={styles.block}>
      <SectionLabel>
        <h3>IDENTIDADE</h3>
      </SectionLabel>

      <div className={styles.fields}>
        <div className={styles.fieldWide}>
          <label className={styles.label} htmlFor="character-name">
            NOME
          </label>
          <input
            className={styles.input}
            id="character-name"
            value={draft.name}
            placeholder="Quem é o personagem"
            onChange={(event) =>
              onChange((current) => ({ ...current, name: event.target.value }))
            }
          />
        </div>

        {/* Nível ao lado do nome, não no rodapé: Evasion, HP, Stress,
            thresholds e Proficiency saem dele. É entrada, não resumo. */}
        <div className={styles.levelRow}>
          <span className={styles.label}>NÍVEL</span>
          <Stepper
            label="nível"
            decreaseLabel="Diminuir nível"
            increaseLabel="Aumentar nível"
            value={String(draft.level)}
            canDecrease={draft.level > MIN_LEVEL}
            canIncrease={draft.level < MAX_LEVEL}
            onDecrease={() => onChange((current) => ({ ...current, level: current.level - 1 }))}
            onIncrease={() => onChange((current) => ({ ...current, level: current.level + 1 }))}
          />
        </div>

        {/* Classe antes de espécie: é ela que move os números. Espécie e origem
            trazem features, não a base de cálculo. */}
        <div>
          <label className={styles.label} htmlFor="character-class">
            CLASSE
          </label>
          <select
            className={styles.input}
            id="character-class"
            value={draft.className ?? ""}
            onChange={(event) =>
              onChange((current) => ({
                ...current,
                className: event.target.value || null,
                // Subclasse só vale se pertencer à classe: trocar a classe
                // limpa a escolha em vez de deixar um par inválido.
                subclass: null,
              }))
            }
          >
            <option value="">—</option>
            {CLASSES.map((classDefinition) => (
              <option key={classDefinition.name}>{classDefinition.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={styles.label} htmlFor="character-subclass">
            SUBCLASSE
          </label>
          <select
            className={styles.input}
            id="character-subclass"
            value={draft.subclass ?? ""}
            onChange={(event) =>
              onChange((current) => ({ ...current, subclass: event.target.value || null }))
            }
          >
            <option value="">—</option>
            {SUBCLASSES.filter(
              (subclass) => !draft.className || subclass.className === draft.className,
            ).map((subclass) => (
              <option key={subclass.name}>{subclass.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={styles.label} htmlFor="character-ancestry">
            ESPÉCIE
          </label>
          <select
            className={styles.input}
            id="character-ancestry"
            value={draft.ancestry ?? ""}
            onChange={(event) =>
              onChange((current) => ({ ...current, ancestry: event.target.value || null }))
            }
          >
            <option value="">—</option>
            {ANCESTRIES.map((ancestry) => (
              <option key={ancestry.name}>{ancestry.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={styles.label} htmlFor="character-community">
            ORIGEM
          </label>
          <select
            className={styles.input}
            id="character-community"
            value={draft.community ?? ""}
            onChange={(event) =>
              onChange((current) => ({ ...current, community: event.target.value || null }))
            }
          >
            <option value="">—</option>
            {COMMUNITIES.map((community) => (
              <option key={community.name}>{community.name}</option>
            ))}
          </select>
        </div>
      </div>
    </section>

    <section className={styles.block}>
      <SectionLabel>
        <h3>ATRIBUTOS</h3>
      </SectionLabel>

      <ul className={styles.traits}>
        {TRAIT_LIST.map((trait) => {
          const stat = derived.traits[trait]

          return (
            <li className={styles.trait} key={trait}>
              <span className={styles.traitName}>
                {trait}
                {stat.total === stat.base ? null : (
                  <span className={styles.traitTotal}> → {formatSigned(stat.total)}</span>
                )}
              </span>
              <Stepper
                label={trait}
                decreaseLabel={`Diminuir ${trait}`}
                increaseLabel={`Aumentar ${trait}`}
                value={formatSigned(stat.base)}
                onDecrease={() =>
                  onChange((current) => ({
                    ...current,
                    traits: { ...current.traits, [trait]: current.traits[trait] - 1 },
                  }))
                }
                onIncrease={() =>
                  onChange((current) => ({
                    ...current,
                    traits: { ...current.traits, [trait]: current.traits[trait] + 1 },
                  }))
                }
              />
            </li>
          )
        })}
      </ul>
    </section>

  </>
)
