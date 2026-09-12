import { SectionLabel } from "@jposawa/ronin-ui"

import { EQUIP_SLOTS, HOPE_MAX, TRAIT_LIST } from "@/constants"
import { MarkerTrack, StatBlock, ThresholdBar } from "@/fragments"
import { domainColorToken, formatSigned } from "@/helpers"
import { useCompendium } from "@/hooks"
import type { Character, DerivedStats, EquipSlot, Marks } from "@/types"

import styles from "./CombatPlay.module.css"

type CombatPlayProps = {
  character: Character
  derived: DerivedStats
  onMarksChange: (marks: Marks) => void
}

/**
 * A ficha em mesa.
 *
 * **A ordem é a ordem das perguntas que a mesa faz**, e cada bloco está ao lado
 * daquele que ele responde:
 *
 * 1. Quem é — nome, nível, tier. Uma faixa fina; identifica, não se usa.
 * 2. **Defesa e atributos no topo.** "Qual sua Evasion?" e "rola Finesse" são
 *    as duas coisas que mais se pergunta numa sessão, e estavam no rodapé.
 * 3. **Dano e vida juntos.** A régua de limiares encosta no HP porque a
 *    pergunta real é "levei 11, marco quanto?" — o número solto não responde.
 * 4. **Hope encosta em HP e Stress**: são os três pips que se tocam durante um
 *    turno, e separá-los obrigava a olhar para dois cantos da tela. Vem com as
 *    Experiences porque é Hope que se gasta para somar uma.
 * 5. **Armas ativas na tela de combate**, não escondidas no inventário: o dado
 *    de dano é consultado a cada ataque.
 *
 * Nada aqui muda um máximo: marcar HP é estado de mesa e grava no toque. O que
 * *define* o máximo é modo edição, com Salvar.
 *
 * **Não há botão de descansar, e a ausência é deliberada.** Havia um, que
 * limpava Stress e Armor Slots de uma vez — e isso não é a regra. Descanso é
 * escolher **duas** ações de downtime de uma lista, e a lista e os valores
 * mudam entre Rest e Long Rest. As próprias cartas do compêndio dizem isso:
 * `Recovery` fala em "choose to do one of the *Long Rest* options instead",
 * `Warm Words` em "use the **Tend to Wounds** downtime move" e `Armorer` em
 * "if you choose to take the **Repair** Armor downtime action".
 *
 * A lista completa e os valores de cada ação não estão em `specs/` nem no dado
 * gerado, então implementar isso seria inventá-los. Enquanto não estiverem
 * escritos, limpar um marcador é tocar o pip — que já funciona e não mente
 * sobre a regra.
 */
export const CombatPlay = ({ character, derived, onMarksChange }: CombatPlayProps) => {
  const { compendium } = useCompendium()

  const lineage = [character.className, character.subclass, character.ancestry, character.community]
    .filter(Boolean)
    .join(" · ")

  const equippedIn = (slot: EquipSlot) =>
    character.inventory.find((entry) => entry.isEquipped && entry.slot === slot)

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

      <section className={styles.defense}>
        <div className={styles.stats}>
          <StatBlock label="EVASION" stat={derived.evasion} />
          <StatBlock label="ARMOR" stat={derived.armorScore} />
          <StatBlock label="PROF" stat={derived.proficiency} pipCount={derived.proficiency.total} />
        </div>

        <p className={styles.wearing}>
          {derived.equippedArmor ? derived.equippedArmor.name : "Sem armadura"}
        </p>

        <MarkerTrack
          className={styles.armorTrack}
          label="ARMOR SLOTS"
          hasCount
          marked={character.marks.armor}
          max={derived.armorScore.total}
          color={domainColorToken("Edge")}
          onChange={(armor) => onMarksChange({ ...character.marks, armor })}
        />
      </section>

      <section className={styles.traits}>
        <SectionLabel>
          <h3>ATRIBUTOS</h3>
        </SectionLabel>

        {/* Só leitura: atributo é máximo, e máximo se muda no modo edição. */}
        <ul className={styles.traitList}>
          {TRAIT_LIST.map((trait) => (
            <li className={styles.trait} key={trait}>
              <span className={styles.traitName}>{trait}</span>
              <b className={styles.traitValue}>{formatSigned(derived.traits[trait].total)}</b>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.vitals}>
        <SectionLabel>
          <h3>DANO E VIDA</h3>
        </SectionLabel>

        <ThresholdBar major={derived.majorThreshold} severe={derived.severeThreshold} />

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

      </section>

      <section className={styles.weapons}>
        <SectionLabel>
          <h3>ARMAS ATIVAS</h3>
        </SectionLabel>

        {/* Armadura fica de fora: ela já aparece como número em ARMOR, e o que
            se consulta a cada ataque é o dado de dano. */}
        <ul className={styles.weaponList}>
          {EQUIP_SLOTS.filter((slot) => slot.id !== "armor").map((slot) => {
            const entry = equippedIn(slot.id)
            const weapon = entry
              ? compendium.weapons.find((candidate) => candidate.name === entry.name)
              : undefined

            return (
              <li className={styles.weapon} key={slot.id}>
                <span className={styles.weaponSlot}>{slot.label.toUpperCase()}</span>

                {weapon ? (
                  <>
                    <span className={styles.weaponName}>{weapon.name}</span>
                    <span className={styles.weaponMeta}>
                      {weapon.trait} · {weapon.range}
                    </span>
                    <b className={styles.weaponDamage}>
                      {derived.proficiency.total}
                      {weapon.damageDie}
                      {formatSigned(weapon.bonusByTier[derived.tier - 1] ?? 0)}
                    </b>
                  </>
                ) : (
                  <span className={styles.weaponEmpty}>
                    Nada empunhado — escolha no Inventário.
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      <section className={styles.hope}>
        <MarkerTrack
          label="HOPE"
          marked={character.marks.hope}
          max={HOPE_MAX}
          color={domainColorToken("Aegis")}
          onChange={(hope) => onMarksChange({ ...character.marks, hope })}
        />

        <SectionLabel detail={String(character.experiences.length)}>
          <h3>EXPERIENCES</h3>
        </SectionLabel>

        {character.experiences.length === 0 ? (
          <p className={styles.empty}>Nenhuma. Adicione em História.</p>
        ) : (
          <ul className={styles.experiences}>
            {character.experiences.map((experience) => (
              <li className={styles.experience} key={experience.name}>
                <span className={styles.experienceName}>{experience.name}</span>
                <b className={styles.experienceBonus}>+{experience.bonus}</b>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
