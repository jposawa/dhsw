import { Button, Stepper } from "@jposawa/ronin-ui"
import React from "react"
import { LuImage, LuPencil } from "react-icons/lu"

import { DomainLabel } from "@/components"
import {
  MAX_LEVEL,
  MIN_LEVEL,
  MIXED_ANCESTRY_LABEL,
  MIXED_ANCESTRY_OPTION,
  TRAIT_LIST,
} from "@/constants"
import { ThresholdBar } from "@/fragments"
import {
  changeClass,
  changeSubclass,
  classChangeLoss,
  describeThresholdOrigin,
  featureNameOf,
  formatSigned,
  heritageFeatures,
  heritageLabel,
  mixedAncestry,
  toImageUrl,
  mixtureName,
  singleAncestry,
} from "@/helpers"
import { useCompendium } from "@/hooks"
import type { Character, DerivedStats, Heritage, Result } from "@/types"

import { ChoiceDrawer, type ChoiceOption } from "./ChoiceDrawer"
import { ChoiceField } from "./ChoiceField"
import { ClassChangeConfirm } from "./ClassChangeConfirm"
import { ClassSummary } from "./ClassSummary"
import { ExperienceEditor } from "./ExperienceEditor"
import { PortraitLinkModal } from "./PortraitLinkModal"
import { OriginFeatures } from "./OriginFeatures"
import { SubclassTiers } from "./SubclassTiers"

import styles from "./CombatEdit.module.css"

type Picker = "class" | "subclass" | "ancestry" | "firstFeature" | "secondFeature" | "community"

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
  const [isLinking, setIsLinking] = React.useState(false)

  const portrait = toImageUrl(draft.avatarUrl ?? "")

  const classDefinition = compendium.classes.find((candidate) => candidate.name === draft.className)
  const subclass = compendium.subclasses.find(
    (candidate) => candidate.name === draft.subclass && candidate.className === draft.className,
  )

  const { heritage } = draft
  const { isMixed, sources } = heritage
  const features = heritageFeatures(draft, compendium)
  const featureAt = (index: 0 | 1) => features.find((feature) => feature.index === index)

  const changeHeritage = (patch: Partial<Heritage>) => {
    onChange((current) => ({ ...current, heritage: { ...current.heritage, ...patch } }))
  }

  /** Troca a ascendência inteira, sem restar campo da anterior. */
  const setHeritage = (next: Heritage) => {
    onChange((current) => ({ ...current, heritage: next }))
  }

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

  /**
   * Trocar de ascendência **substitui** a anterior, nas duas direções: nada da
   * que estava fica para trás. A mista não é uma variação da espécie escolhida
   * antes — herdá-la como 1ª feature tratava duas ascendências diferentes como
   * se uma fosse metade da outra.
   */
  const chooseAncestry = (option: string) => {
    closePicker()
    setHeritage(option === MIXED_ANCESTRY_OPTION ? mixedAncestry() : singleAncestry(option))
  }

  const chooseSource = (slot: "first" | "second") => (ancestry: string) => {
    closePicker()
    changeHeritage({ sources: { ...sources, [slot]: ancestry } })
  }

  const chooseCommunity = (community: string) => {
    closePicker()
    onChange((current) => ({ ...current, community }))
  }

  const classOptions: ChoiceOption[] = compendium.classes.map((option) => ({
    name: option.name,
    stripeDomains: option.domains,
    meta: option.domains.map((domain) => <DomainLabel key={domain} domain={domain} />),
    body: <ClassSummary classDefinition={option} isPreview />,
  }))

  const subclassOptions: ChoiceOption[] = compendium.subclasses
    .filter((option) => option.className === draft.className)
    .map((option) => ({
      name: option.name,
      stripeDomains: classDefinition?.domains,
      meta: option.spellcastTrait
        ? `FORCEWIELDING · ${option.spellcastTrait}`
        : "SEM FORCEWIELDING",
      body: <SubclassTiers subclass={option} />,
    }))

  const ancestryOptions: ChoiceOption[] = [
    ...compendium.ancestries.map((option) => ({
      name: option.name,
      body: <OriginFeatures description={option.description} features={option.features} />,
    })),
    {
      name: MIXED_ANCESTRY_LABEL,
      value: MIXED_ANCESTRY_OPTION,
      meta: "DUAS ESPÉCIES",
      body: (
        <p className={styles.note}>
          A 1ª feature vem de uma espécie e a 2ª de outra, nunca as duas da mesma. Escolhendo aqui,
          os dois campos de feature aparecem na ficha.
        </p>
      ),
    },
  ]

  /** Cada espécie com a feature daquela posição — é ela que se está escolhendo. */
  const featureOptions = (index: 0 | 1, other: string | null): ChoiceOption[] =>
    compendium.ancestries
      .filter((option) => option.name !== other && option.features[index] !== undefined)
      .map((option) => ({
        name: option.name,
        meta: featureNameOf(option.features[index] ?? "") ?? undefined,
        body: <OriginFeatures features={[option.features[index] ?? ""]} />,
      }))

  const communityOptions: ChoiceOption[] = compendium.communities.map((option) => ({
    name: option.name,
    body: <OriginFeatures description={option.description} features={[option.feature]} />,
  }))

  return (
    <div className={styles.layout}>
      <section className={styles.identity} aria-label="Identidade">
        <fieldset className={styles.fields}>
          {/* Nome e nível na mesma fileira: o nível fora da grade dos campos é
              o que mantém as duas colunas de baixo iguais. */}
          <div className={styles.nameRow}>
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

            {/* Nível com a largura do stepper: é entrada, não resumo, e um
                número de 1 a 10 não precisa de meia tela. */}
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
          </div>

          {/* A prévia no lugar do campo: um endereço de 200 caracteres não
              diz nada sobre a imagem, e a imagem diz tudo. Trocar abre o mesmo
              modal que a gaveta do modo jogo abre. */}
          <div className={styles.portraitField}>
            <span className={styles.label}>IMAGEM DO PERSONAGEM</span>

            <div className={styles.portraitRow}>
              {portrait ? (
                <img className={styles.portraitPreview} src={portrait} alt="" />
              ) : (
                <span className={styles.portraitPreview} aria-hidden="true">
                  <LuImage />
                </span>
              )}

              <Button
                className={styles.portraitEdit}
                variant="outline"
                aria-label={portrait ? "Trocar a imagem do personagem" : "Pôr uma imagem no personagem"}
                onClick={() => setIsLinking(true)}
              >
                <LuPencil aria-hidden="true" />
                &nbsp;{portrait ? "TROCAR" : "PÔR IMAGEM"}
              </Button>
            </div>
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
            className={styles.field}
            label="SUBCLASSE"
            value={draft.subclass}
            placeholder={draft.className ? "Escolher subclasse" : "Escolha a classe antes"}
            detail={subclass?.spellcastTrait ? `FORCEWIELDING · ${subclass.spellcastTrait}` : null}
            isDisabled={!draft.className}
            onOpen={() => setPicker("subclass")}
          />

          {/* Na mista o campo mostra o nome da mistura, como o vizinho mostra o
              nome da classe — que ela é mista está no grupo logo abaixo, e
              repetir aqui era a mesma linha duas vezes seguidas. */}
          <ChoiceField
            className={styles.field}
            label="ESPÉCIE"
            value={heritageLabel(draft)}
            placeholder="Escolher espécie"
            onOpen={() => setPicker("ancestry")}
          />

          <ChoiceField
            className={styles.field}
            label="ORIGEM"
            value={draft.community}
            placeholder="Escolher origem"
            onOpen={() => setPicker("community")}
          />

          {/* Mista: a espécie de cada feature, e o nome da mistura — que o livro
              deixa a cargo da mesa (p. 70–71). Num grupo próprio, porque os três
              são desdobramento da espécie acima e não campos soltos no fim. */}
          {isMixed ? (
            <fieldset className={styles.mixedGroup}>
              <legend className={styles.mixedLegend}>{MIXED_ANCESTRY_LABEL.toUpperCase()}</legend>

              <ChoiceField
                className={styles.field}
                label="1ª FEATURE"
                value={featureAt(0)?.name ?? null}
                placeholder="Escolher 1ª feature"
                detail={sources.first}
                onOpen={() => setPicker("firstFeature")}
              />

              <ChoiceField
                className={styles.field}
                label="2ª FEATURE"
                value={featureAt(1)?.name ?? null}
                placeholder="Escolher 2ª feature"
                detail={sources.second}
                onOpen={() => setPicker("secondFeature")}
              />

              <label className={styles.nameField}>
                <span className={styles.label}>NOME DA MISTURA</span>
                <input
                  className={styles.input}
                  value={heritage.name ?? ""}
                  placeholder={mixtureName(heritage) ?? "Como a mesa chama esta mistura"}
                  maxLength={40}
                  onChange={(event) => changeHeritage({ name: event.target.value || null })}
                />
              </label>
            </fieldset>
          ) : null}
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

      {/* As Experiences se leem no modo jogo, dois blocos acima dos atributos:
          editá-las noutra aba separava a lista de onde ela serve. */}
      <ExperienceEditor
        className={styles.experiences}
        character={draft}
        onApply={onApply}
      />

      {isLinking ? (
        <PortraitLinkModal
          key={draft.avatarUrl ?? ""}
          isOpen
          avatarUrl={draft.avatarUrl}
          onConfirm={(avatarUrl) => {
            onChange((current) => ({ ...current, avatarUrl }))
            setIsLinking(false)
          }}
          onClose={() => setIsLinking(false)}
        />
      ) : null}

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
        current={isMixed ? MIXED_ANCESTRY_OPTION : heritage.name}
        onChoose={chooseAncestry}
        onClose={closePicker}
      />
      <ChoiceDrawer
        isOpen={picker === "firstFeature"}
        title="Escolher 1ª feature"
        note="A espécie usada na 2ª feature não aparece: as duas não podem sair da mesma."
        options={featureOptions(0, sources.second)}
        current={sources.first}
        onChoose={chooseSource("first")}
        onClose={closePicker}
      />
      <ChoiceDrawer
        isOpen={picker === "secondFeature"}
        title="Escolher 2ª feature"
        note="A espécie usada na 1ª feature não aparece: as duas não podem sair da mesma."
        options={featureOptions(1, sources.first)}
        current={sources.second}
        onChoose={chooseSource("second")}
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
