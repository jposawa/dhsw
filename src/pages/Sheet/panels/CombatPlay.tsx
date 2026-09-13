import { Button, SectionLabel } from "@jposawa/ronin-ui"
import React from "react"

import { DotScale } from "@/components"
import { EQUIP_SLOTS, HOPE_MAX, MAX_PROFICIENCY, TRAIT_LIST, TRAIT_VERBS } from "@/constants"
import { FeatureText, MarkerTrack, RuleText, StatBlock, ThresholdBar } from "@/fragments"
import { describeThresholdOrigin, domainColorToken, formatSigned } from "@/helpers"
import { useCompendium } from "@/hooks"
import type { Character, DerivedStats, EquipSlot, Marks, Result } from "@/types"

import { ActiveWeapon } from "./ActiveWeapon"
import { RestDrawer } from "./RestDrawer"

import styles from "./CombatPlay.module.css"

const describeWearing = (derived: DerivedStats): string => {
  const armor = derived.equippedArmor

  if (armor) {
    return `${armor.name} · ${armor.line} · Tier ${armor.tier}`
  }

  return derived.hasBareBones ? "Sem armadura · Bare Bones" : "Sem armadura"
}

type CombatPlayProps = {
  character: Character
  derived: DerivedStats
  isReadOnly: boolean
  onMarksChange: (marks: Marks) => void
  onApply: (result: Result<Character>) => void
}

/**
 * A ficha em mesa.
 *
 * **A ordem é a das perguntas da mesa**, e cada bloco encosta no que responde:
 *
 * 1. Quem é — nome, classe, nível. Uma faixa fina; identifica, não se usa.
 * 2. **Defesa**: Evasion e Armor, com os Armor Slots colados no Armor — gastar
 *    slot é reduzir o dano que acabou de chegar.
 * 3. **Atributos** com os verbos da ficha do livro: "rola o quê para pular?"
 *    se responde olhando, sem decorar a lista.
 * 4. **Dano e vida juntos**: a régua de thresholds em cima do HP, porque a
 *    pergunta real é "levei 11, marco quanto?".
 * 5. **Hope** com a Hope feature da classe e as Experiences — é Hope que se
 *    gasta nas duas.
 * 6. **Armas** com Proficiency já nos dados e a feature à vista.
 *
 * Nada aqui muda um máximo: marcar é estado de mesa e grava no toque. O que
 * define o máximo é modo edição, com Salvar. Descansar também é jogada: duas
 * ações de downtime, confirmadas na gaveta.
 */
export const CombatPlay = ({
  character,
  derived,
  isReadOnly,
  onMarksChange,
  onApply,
}: CombatPlayProps) => {
  const { compendium } = useCompendium()
  const [isResting, setIsResting] = React.useState(false)

  const classDefinition = compendium.classes.find(
    (candidate) => candidate.name === character.className,
  )
  const lineage = [character.className, character.subclass, character.ancestry, character.community]
    .filter(Boolean)
    .join(" · ")

  const equippedIn = (slot: EquipSlot) =>
    character.inventory.find((entry) => entry.isEquipped && entry.slot === slot)

  const weaponOf = (slot: EquipSlot) => {
    const entry = equippedIn(slot)

    return entry ? compendium.weapons.find((candidate) => candidate.name === entry.name) : undefined
  }

  const isPrimaryTwoHanded = weaponOf("primary")?.burden === "Duas mãos"

  const armor = derived.equippedArmor

  const needsClass = classDefinition === undefined

  return (
    <div className={styles.layout}>
      <header className={styles.identity}>
        <div className={styles.identityText}>
          <h2 className={styles.name}>{character.name || "Sem nome"}</h2>
          <p className={styles.lineage}>{lineage || "ficha em branco"}</p>
        </div>

        <div className={styles.identitySide}>
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

          {/* No cabeçalho e em texto: descanso acontece entre cenas, poucas vezes
              por sessão, e não disputa espaço com os pips que se tocam no turno. */}
          <Button
            className={styles.restButton}
            variant="text"
            disabled={isReadOnly}
            onClick={() => setIsResting(true)}
          >
            DESCANSAR
          </Button>
        </div>
      </header>

      {needsClass ? (
        <p className={styles.notice}>
          Sem classe, não há Evasion nem Hit Points. Escolha a classe em Editar ficha.
        </p>
      ) : null}

      <section className={styles.defense} aria-label="Defesa">
        <div className={styles.stats}>
          <StatBlock label="EVASION" stat={derived.evasion} />
          <StatBlock label="ARMOR" stat={derived.armorScore} />
        </div>

        <div className={styles.armor}>
          <p className={styles.wearing}>{describeWearing(derived)}</p>
          {armor?.features.map((feature) => (
            <FeatureText key={feature} name={feature} />
          ))}

          <MarkerTrack
            label="ARMOR SLOTS"
            hasCount
            marked={character.marks.armor}
            max={derived.armorScore.total}
            color={domainColorToken("Edge")}
            emptyText="Armor Score 0: não há slot para marcar."
            onChange={(armorMarks) => onMarksChange({ ...character.marks, armor: armorMarks })}
          />
        </div>
      </section>

      <section className={styles.traits}>
        <SectionLabel>
          <h3>ATRIBUTOS</h3>
        </SectionLabel>

        <ul className={styles.traitList}>
          {TRAIT_LIST.map((trait) => (
            <li
              className={styles.trait}
              key={trait}
              data-spellcast={derived.spellcastTrait === trait || undefined}
            >
              <span className={styles.traitName}>{trait}</span>
              <b className={styles.traitValue}>{formatSigned(derived.traits[trait].total)}</b>
              <span className={styles.traitVerbs}>{TRAIT_VERBS[trait].join(" · ")}</span>
              {derived.spellcastTrait === trait ? (
                <span className={styles.spellcast}>FORCEWIELDING</span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.vitals}>
        <SectionLabel>
          <h3>DANO E VIDA</h3>
        </SectionLabel>

        <ThresholdBar
          major={derived.majorThreshold}
          severe={derived.severeThreshold}
          origin={describeThresholdOrigin(derived)}
        />

        <MarkerTrack
          label="HIT POINTS"
          hasCount
          marked={character.marks.hp}
          max={derived.hitPointsMax.total}
          color={domainColorToken("Havoc")}
          emptyText="A classe define os Hit Points."
          onChange={(hp) => onMarksChange({ ...character.marks, hp })}
        />
        <MarkerTrack
          label="STRESS"
          hasCount
          marked={character.marks.stress}
          max={derived.stressMax.total}
          color={domainColorToken("Essence")}
          onChange={(stress) => onMarksChange({ ...character.marks, stress })}
        />
      </section>

      <section className={styles.hope}>
        <MarkerTrack
          label="HOPE"
          hasCount
          marked={character.marks.hope}
          max={HOPE_MAX}
          color={domainColorToken("Aegis")}
          onChange={(hope) => onMarksChange({ ...character.marks, hope })}
        />

        <p className={styles.hint}>Gaste uma Hope para usar uma Experience ou ajudar um aliado.</p>

        {classDefinition ? (
          <RuleText className={styles.hopeFeature} text={classDefinition.hopeFeature} />
        ) : null}

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

      <section className={styles.weapons}>
        <SectionLabel
          detail={
            <span className={styles.proficiency}>
              PROFICIENCY {derived.proficiency.total}
              <DotScale
                label="Proficiency"
                value={derived.proficiency.total}
                max={MAX_PROFICIENCY}
              />
            </span>
          }
        >
          <h3>ARMAS ATIVAS</h3>
        </SectionLabel>

        <ul className={styles.weaponList}>
          {EQUIP_SLOTS.filter((slot) => slot.id !== "armor").map((slot) => (
            <ActiveWeapon
              key={slot.id}
              slotLabel={slot.label.toUpperCase()}
              entry={equippedIn(slot.id)}
              weapon={weaponOf(slot.id)}
              proficiency={derived.proficiency.total}
              tierIndex={derived.tier - 1}
              emptyText={
                slot.id === "secondary" && isPrimaryTwoHanded
                  ? "A primária é de duas mãos."
                  : "Nada empunhado — escolha no Inventário."
              }
            />
          ))}
        </ul>
      </section>

      <RestDrawer
        isOpen={isResting}
        character={character}
        derived={derived}
        onApply={onApply}
        onClose={() => setIsResting(false)}
      />
    </div>
  )
}
