import { SectionLabel } from "@jposawa/ronin-ui"

import { TRAIT_LIST } from "@/constants"
import { MarkerTrack, StatBlock } from "@/fragments"
import { domainColorToken, formatSigned } from "@/helpers"
import type { Character, DerivedStats } from "@/types"

import styles from "./CombatPlay.module.css"

type CombatPlayProps = {
  character: Character
  derived: DerivedStats
  isReadOnly: boolean
  onMarksChange: (marks: Character["marks"]) => void
}

/**
 * A ficha em mesa.
 *
 * **A ordem é a frequência de uso, e nada mais.** Marcador primeiro, porque é o
 * que se toca a cada turno; traço em seguida, porque toda rolagem de ação passa
 * por um; defesa depois, porque só é consultada quando o dano chega. A
 * identidade fica num cabeçalho fino no topo — ela responde "que ficha é esta",
 * não "o que eu faço agora", e ocupar meia tela com seis campos de formulário
 * era o que empurrava o resto para baixo da dobra.
 *
 * **Nada aqui muda um máximo.** Marcar HP é estado de mesa e grava no toque;
 * mudar o que *define* o máximo é modo edição, com Salvar. É a divisão que
 * separa o que não pode pedir confirmação do que não pode ser gravado sem ela.
 */
export const CombatPlay = ({
  character,
  derived,
  isReadOnly,
  onMarksChange,
}: CombatPlayProps) => {
  const lineage = [character.className, character.subclass, character.ancestry, character.community]
    .filter(Boolean)
    .join(" · ")

  return (
    <div className={styles.layout}>
      <header className={styles.identity}>
        <div className={styles.identityText}>
          <h2 className={styles.name}>{character.name || "Sem nome"}</h2>
          <p className={styles.lineage}>{lineage || "ficha em branco"}</p>
        </div>

        <dl className={styles.levelBadge}>
          <div className={styles.levelCell}>
            <dt>NÍVEL</dt>
            <dd>{derived.level}</dd>
          </div>
          <div className={styles.levelCell}>
            <dt>TIER</dt>
            <dd>{derived.tier}</dd>
          </div>
        </dl>
      </header>

      <section className={styles.marks}>
        <SectionLabel>
          <h3>MARCADORES</h3>
        </SectionLabel>

        <div className={styles.tracks}>
          <MarkerTrack
            label="HIT POINTS"
            marked={character.marks.hp}
            max={derived.hitPointsMax.total}
            color={domainColorToken("Havoc")}
            onChange={(hp) => onMarksChange({ ...character.marks, hp })}
          />
          <MarkerTrack
            label="STRESS"
            marked={character.marks.stress}
            max={derived.stressMax.total}
            color={domainColorToken("Essence")}
            onChange={(stress) => onMarksChange({ ...character.marks, stress })}
          />
          <MarkerTrack
            label="HOPE"
            marked={character.marks.hope}
            max={6}
            color={domainColorToken("Aegis")}
            onChange={(hope) => onMarksChange({ ...character.marks, hope })}
          />
          <MarkerTrack
            label="ARMOR SLOTS"
            marked={character.marks.armor}
            max={derived.armorScore.total}
            color={domainColorToken("Edge")}
            onChange={(armor) => onMarksChange({ ...character.marks, armor })}
          />
        </div>

        {/* Junto dos marcadores porque é o que ele mexe. No rodapé da tela
            seria um botão sem contexto. */}
        <button
          type="button"
          className={styles.rest}
          disabled={isReadOnly}
          onClick={() => onMarksChange({ ...character.marks, stress: 0, armor: 0 })}
        >
          DESCANSAR — LIMPAR STRESS E ARMOR SLOTS
        </button>
      </section>

      <section className={styles.attributes}>
        <SectionLabel>
          <h3>ATRIBUTOS</h3>
        </SectionLabel>

        {/* Só leitura: atributo é máximo, e máximo se muda no modo edição. */}
        <ul className={styles.traits}>
          {TRAIT_LIST.map((trait) => (
            <li className={styles.trait} key={trait}>
              <span className={styles.traitName}>{trait}</span>
              <b className={styles.traitValue}>{formatSigned(derived.traits[trait].total)}</b>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.defense}>
        <SectionLabel>
          <h3>DEFESA</h3>
        </SectionLabel>

        <div className={styles.stats}>
          <StatBlock label="EVASION" stat={derived.evasion} />
          <StatBlock label="PROF" stat={derived.proficiency} />
          <StatBlock label="ARMOR" stat={derived.armorScore} />
          <StatBlock label="MAJOR" stat={derived.majorThreshold} />
        </div>

        <div className={styles.thresholds}>
          <div className={styles.thresholdCell}>
            <b className={styles.thresholdValue}>{derived.severeThreshold.total}</b>
            SEVERE
          </div>
          <div className={styles.thresholdCell}>
            <b className={styles.thresholdValue}>
              {derived.isBareBones ? "Bare Bones" : derived.equippedArmor?.line}
            </b>
            {derived.equippedArmor ? derived.equippedArmor.name.toUpperCase() : "SEM ARMADURA"}
          </div>
        </div>

        {derived.isBareBones ? (
          <p className={styles.note}>
            Sem armadura vestida: Armor Score 3 + Strength, thresholds{" "}
            {derived.majorThreshold.base}/{derived.severeThreshold.base} + nível. Não é erro —
            é escolha de build.
          </p>
        ) : null}
      </section>
    </div>
  )
}
