import { Stepper } from "@jposawa/ronin-ui"
import React from "react"

import { DomainLabel } from "@/components"
import { MAX_LEVEL, MIN_LEVEL, TRAIT_LIST } from "@/constants"
import { ThresholdBar } from "@/fragments"
import { describeThresholdOrigin, domainColorToken, formatSigned } from "@/helpers"
import { useCompendium } from "@/hooks"
import { changeClass, changeSubclass, classChangeLoss } from "@/rules"
import type { Character, DerivedStats, Result } from "@/types"

import { ChoiceDrawer, type ChoiceOption } from "./ChoiceDrawer"
import { ChoiceField } from "./ChoiceField"
import { ClassChangeConfirm } from "./ClassChangeConfirm"
import { ClassSummary } from "./ClassSummary"
import { OriginFeatures } from "./OriginFeatures"
import { SubclassTiers } from "./SubclassTiers"

import styles from "./CombatEdit.module.css"

type Picker = "class" | "subclass" | "ancestry" | "community"

type CombatEditProps = {
  draft: Character
  derived: DerivedStats
  onChange: (mutate: (current: Character) => Character) => void
  onApply: (result: Result<Character>) => void
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
 * Classe, subclasse, espécie e origem abrem gaveta, com as features de cada
 * opção: o nome sozinho não diz o que se está escolhendo. Trocar de classe
 * pede confirmação quando há subclasse ou carta a perder.
 *
 * Marcador não aparece aqui de propósito — ele é estado de mesa, mora no modo
 * jogo e grava no toque.
 */
export const CombatEdit = ({ draft, derived, onChange, onApply }: CombatEditProps) => {
  const { compendium } = useCompendium()

  const [picker, setPicker] = React.useState<Picker | null>(null)
  const [pendingClass, setPendingClass] = React.useState<string | null>(null)

  const classDefinition = compendium.classes.find((candidate) => candidate.name === draft.className)
  const subclass = compendium.subclasses.find(
    (candidate) => candidate.name === draft.subclass && candidate.className === draft.className,
  )

  const closePicker = () => {
    setPicker(null)
  }

  const chooseClass = (className: string) => {
    closePicker()
    const loss = classChangeLoss(draft, className)

    if (loss.subclass !== null || loss.cardCount > 0) {
      setPendingClass(className)

      return
    }

    onApply(changeClass(draft, className, compendium))
  }

  const confirmClass = () => {
    if (pendingClass) {
      onApply(changeClass(draft, pendingClass, compendium))
    }

    setPendingClass(null)
  }

  const chooseSubclass = (subclassName: string) => {
    closePicker()
    onApply(changeSubclass(draft, subclassName, compendium))
  }

  const chooseAncestry = (ancestry: string) => {
    closePicker()
    onChange((current) => ({ ...current, ancestry }))
  }

  const chooseCommunity = (community: string) => {
    closePicker()
    onChange((current) => ({ ...current, community }))
  }

  const classOptions: ChoiceOption[] = compendium.classes.map((option) => ({
    name: option.name,
    stripeColor: domainColorToken(option.domains[0]),
    meta: option.domains.map((domain) => <DomainLabel key={domain} domain={domain} />),
    body: <ClassSummary classDefinition={option} isPreview />,
  }))

  const subclassOptions: ChoiceOption[] = compendium.subclasses
    .filter((option) => option.className === draft.className)
    .map((option) => ({
      name: option.name,
      stripeColor: classDefinition ? domainColorToken(classDefinition.domains[0]) : undefined,
      meta: option.spellcastTrait
        ? `FORCEWIELDING · ${option.spellcastTrait}`
        : "SEM FORCEWIELDING",
      body: <SubclassTiers subclass={option} />,
    }))

  const ancestryOptions: ChoiceOption[] = compendium.ancestries.map((option) => ({
    name: option.name,
    body: <OriginFeatures description={option.description} features={option.features} />,
  }))

  const communityOptions: ChoiceOption[] = compendium.communities.map((option) => ({
    name: option.name,
    body: <OriginFeatures description={option.description} features={[option.feature]} />,
  }))

  return (
    <div className={styles.layout}>
      <section className={styles.identity} aria-label="Identidade">
        <fieldset className={styles.fields}>
          <label className={styles.nameField}>
            <span className={styles.label}>NOME</span>
            <input
              className={styles.input}
              value={draft.name}
              placeholder="Quem é o personagem"
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
            />
          </label>

          {/* Nível ao lado do nome e com a largura do stepper: é entrada, não
              resumo, e um número de 1 a 10 não precisa de meia tela. */}
          <div className={styles.levelRow}>
            <span className={styles.label}>NÍVEL</span>
            <Stepper
              label="nível"
              decreaseLabel="Diminuir nível"
              increaseLabel="Aumentar nível"
              value={String(draft.level)}
              canDecrease={draft.level > MIN_LEVEL}
              canIncrease={draft.level < MAX_LEVEL}
              onDecrease={() =>
                onChange((current) => ({
                  ...current,
                  level: current.level - 1,
                }))
              }
              onIncrease={() =>
                onChange((current) => ({
                  ...current,
                  level: current.level + 1,
                }))
              }
            />
          </div>

          {/* Classe antes de espécie: é ela que move os números. Espécie e origem
              trazem features, não a base de cálculo. */}
          <ChoiceField
            className={styles.field}
            label="CLASSE"
            value={draft.className}
            placeholder="Escolher classe"
            detail={classDefinition?.domains.map((domain) => (
              <DomainLabel key={domain} domain={domain} />
            ))}
            onOpen={() => setPicker("class")}
          />

          <ChoiceField
            className={styles.fieldEnd}
            label="SUBCLASSE"
            value={draft.subclass}
            placeholder={draft.className ? "Escolher subclasse" : "Escolha a classe antes"}
            detail={subclass?.spellcastTrait ? `FORCEWIELDING · ${subclass.spellcastTrait}` : null}
            isDisabled={!draft.className}
            onOpen={() => setPicker("subclass")}
          />

          <ChoiceField
            className={styles.field}
            label="ESPÉCIE"
            value={draft.ancestry}
            placeholder="Escolher espécie"
            onOpen={() => setPicker("ancestry")}
          />

          <ChoiceField
            className={styles.fieldEnd}
            label="ORIGEM"
            value={draft.community}
            placeholder="Escolher origem"
            onOpen={() => setPicker("community")}
          />
        </fieldset>
      </section>

      {/* Sem título: os números mudando enquanto se escolhe já dizem o que a
          seção é. O nome fica para quem ouve. */}
      <section className={styles.previewBlock} aria-label="O que isso muda">
        <dl className={styles.preview}>
          <div className={styles.previewCell}>
            <dt>TIER</dt>
            <dd>{derived.tier}</dd>
          </div>
          <div className={styles.previewCell}>
            <dt>EVASION</dt>
            <dd>{derived.evasion.total}</dd>
          </div>
          <div className={styles.previewCell}>
            <dt>ARMOR</dt>
            <dd>{derived.armorScore.total}</dd>
          </div>
          <div className={styles.previewCell}>
            <dt>HP</dt>
            <dd>{derived.hitPointsMax.total}</dd>
          </div>
          <div className={styles.previewCell}>
            <dt>STRESS</dt>
            <dd>{derived.stressMax.total}</dd>
          </div>
          <div className={styles.previewCell}>
            <dt>PROF</dt>
            <dd>{derived.proficiency.total}</dd>
          </div>
        </dl>

        {/* Os thresholds são a mesma régua do modo jogo: dois números soltos
            em caixas diziam menos e não se pareciam com a ficha. */}
        <ThresholdBar
          major={derived.majorThreshold}
          severe={derived.severeThreshold}
          origin={describeThresholdOrigin(derived)}
        />
      </section>

      <section className={styles.attributes} aria-label="Atributos">
        <ul className={styles.traits}>
          {TRAIT_LIST.map((trait) => {
            const stat = derived.traits[trait]

            return (
              <li
                className={styles.trait}
                key={trait}
                data-spellcast={derived.spellcastTrait === trait || undefined}
              >
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
                      traits: {
                        ...current.traits,
                        [trait]: current.traits[trait] - 1,
                      },
                    }))
                  }
                  onIncrease={() =>
                    onChange((current) => ({
                      ...current,
                      traits: {
                        ...current.traits,
                        [trait]: current.traits[trait] + 1,
                      },
                    }))
                  }
                />
                {derived.spellcastTrait === trait ? (
                  <span className={styles.spellcast}>FORCEWIELDING</span>
                ) : null}
              </li>
            )
          })}
        </ul>
      </section>

      <ChoiceDrawer
        isOpen={picker === "class"}
        title="Escolher classe"
        options={classOptions}
        current={draft.className}
        onChoose={chooseClass}
        onClose={closePicker}
      />
      <ChoiceDrawer
        isOpen={picker === "subclass"}
        title={`Subclasse de ${draft.className ?? ""}`}
        options={subclassOptions}
        current={draft.subclass}
        onChoose={chooseSubclass}
        onClose={closePicker}
      />
      <ChoiceDrawer
        isOpen={picker === "ancestry"}
        title="Escolher espécie"
        options={ancestryOptions}
        current={draft.ancestry}
        onChoose={chooseAncestry}
        onClose={closePicker}
      />
      <ChoiceDrawer
        isOpen={picker === "community"}
        title="Escolher origem"
        options={communityOptions}
        current={draft.community}
        onChoose={chooseCommunity}
        onClose={closePicker}
      />

      <ClassChangeConfirm
        targetClass={pendingClass}
        loss={
          pendingClass ? classChangeLoss(draft, pendingClass) : { subclass: null, cardCount: 0 }
        }
        onConfirm={confirmClass}
        onCancel={() => setPendingClass(null)}
      />
    </div>
  )
}
