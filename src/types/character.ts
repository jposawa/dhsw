import type { TokenPool } from "./compendium"
import type { Domain, Level, Tier, Trait } from "./domain"
import type { ResolvedStat, StatKey } from "./modifier"

export type InventoryEntryKind = "weapon" | "armor" | "item" | "consumable"
export type EquipSlot = "primary" | "secondary" | "armor"

export type InventoryEntry = {
  id: string
  kind: InventoryEntryKind
  /** Nome no compêndio. */
  name: string
  isEquipped: boolean
  slot: EquipSlot | null
  quantity: number
  /**
   * Augments instalados nesta arma, por nome — só com a regra da casa "Armas
   * customizáveis". Por instância: o blaster A com Scope e o B sem.
   */
  installedModules: readonly string[]
  nickname: string | null
}

export type AdvancementKind =
  | "trait"
  | "hp"
  | "stress"
  | "evasion"
  | "proficiency"
  | "subclass"
  | "multiclass"
  | "domainCard"
  | "experience"

/**
 * O que um avanço move, em número.
 *
 * É o próprio avanço que diz **qual chave** muda e **quanto** — não quem o lê.
 * Antes, `derive` tinha um `switch` sobre o `kind` decidindo isso: cada
 * avanço novo pedia um `case` lá, e um avanço de regra da casa era
 * impossível sem mexer na matemática.
 */
export type AdvancementChange = {
  target: StatKey
  value: number
}

/**
 * Um avanço comprado num nível.
 *
 * `kind` é o que a pessoa escolheu na lista — serve para a tela agrupar e
 * para contar quantas vezes um avanço repetível foi comprado. `changes` é o
 * efeito, e é o que a matemática lê.
 */
export type Advancement = {
  level: Level
  kind: AdvancementKind
  /**
   * As escolhas que o avanço pediu: os **dois** atributos, as **duas**
   * Experiences, o domínio da multiclasse. Vazio quando o avanço não pede
   * nada — ele só move um número.
   *
   * Lista e não campo único porque o livro pede dois de cada vez nos dois
   * avanços que pedem escolha (p. 110): um só deixaria metade do avanço
   * comprado sem aparecer na ficha.
   */
  details: readonly string[]
  changes: readonly AdvancementChange[]
  /** Proficiency e multiclasse custam os dois advancements do nível. */
  slotsSpent: 1 | 2
}

/**
 * Um avanço na lista da folha de level up: como se chama e quantas vezes cada
 * tier o oferece.
 *
 * `slotsByTier` é indexado por `tier - 1`, como `FeatureModifier.valueByTier`.
 * Zero é **o tier não oferece**, e é o que mantém subclasse e Proficiency fora
 * do Tier 2 sem um `if` por opção espalhado pela tela.
 */
export type AdvancementOption = {
  kind: AdvancementKind
  label: string
  slotsByTier: readonly [number, number, number, number]
}

/**
 * Os seis atributos, como a ficha os guarda.
 *
 * `null` é **por distribuir**, e não zero: zero é um valor do array, e usar o
 * mesmo número para as duas coisas faria uma ficha nova parecer ter dois
 * atributos já escolhidos. `derive` lê `null` como zero.
 */
export type TraitValues = Readonly<Record<Trait, number | null>>

/**
 * Uma Experience: o nome e o bônus **base**.
 *
 * O base é sempre o +2 com que ela nasce (p. 109). O que cresce vem de avanço
 * e entra como modificador, em `experience.<nome>` — ver `derive`. Por isso
 * não há como editar este número na tela: ele não é escolha, é regra.
 */
export type Experience = {
  name: string
  bonus: number
}

/** Uma Experience com o bônus resolvido: a base e o que os avanços somaram. */
export type ResolvedExperience = {
  name: string
  bonus: ResolvedStat
}

/** Marcadores de mesa. Contagem, não array de booleanos — o máximo é derivado. */
export type Marks = {
  hp: number
  stress: number
  armor: number
  hope: number
}

/**
 * Tokens disponíveis agora numa fonte — feature de classe, de subclasse ou
 * carta. Por ficha: o Implacable da ficha A não é o da ficha B.
 *
 * Fonte sem entrada está no valor inicial: cheia, ou zerada se for acumulador.
 * É o que a reposição faz — apaga a entrada.
 */
/** De onde uma pool de tokens vem: uma feature de classe, de subclasse, ou uma carta. */
export type TokenSource = "class" | "subclass" | "card"

/** O que se perde trocando de classe. Vazio quando não há o que perder. */
export type ClassChangeLoss = {
  subclass: string | null
  cardCount: number
}

/** Uma fonte de tokens que a ficha tem agora. */
export type ActiveTokenPool = {
  key: string
  source: TokenSource
  /** A classe, a subclasse ou a carta. */
  owner: string
  /** A feature, ou a habilidade da carta. */
  name: string
  pool: TokenPool
  /** Teto dos tokens. `null` é acumulador, sem teto. */
  max: number | null
  /** Faces do dado, quando a fonte é um punhado de dados. `null` é marca. */
  dieSides: number | null
  /** Cor do domínio, para o contador acompanhar a carta ou a classe. */
  domain: Domain | null
}

export type TokenCount = {
  /** Chave da fonte, de `tokenPoolKey` em `rules/tokens.ts`. */
  pool: string
  count: number
  /**
   * As faces dos dados ainda **não gastos**, quando a fonte é um punhado de
   * dados e não de marcas — ver `TokenPool.dieSides`. `count` acompanha o
   * tamanho desta lista; quem lê dado lê daqui, e quem lê marca lê o `count`.
   *
   * Ausente na fonte de marcas. O RTDB apaga lista vazia, então "sem dados" e
   * "campo ausente" são a mesma coisa de propósito.
   */
  values?: readonly number[]
}

/**
 * A ascendência da ficha.
 *
 * **Uma forma só, para toda ascendência.** Espécie única e mista não são dois
 * formatos: as duas têm um nome e duas fontes de feature. Na única as duas
 * fontes são a mesma espécie; na mista, duas diferentes (Core Rulebook,
 * p. 70–71). Não existe código sentinela de "mista" ocupando o campo do nome —
 * a mista é uma ascendência à parte e **não** deriva da espécie que estava
 * escolhida antes dela.
 */
export type Heritage = {
  /**
   * Como ela se chama. Na única é o nome da espécie; na mista é o nome que a
   * mesa deu à mistura, que o livro deixa livre ("goblin-orc", "toothling") e
   * que pode não existir ainda.
   */
  name: string | null
  /** De qual espécie vem cada feature. Na única, as duas são a mesma. */
  sources: HeritageSources
  /**
   * Escolha, e não dedução a partir das fontes: mista recém-escolhida ainda
   * não tem fonte nenhuma, e sem esta marca ela seria indistinguível de ficha
   * em branco — a tela não saberia mostrar os dois campos de feature.
   */
  isMixed: boolean
}

export type HeritageSources = {
  /** A espécie que dá a 1ª feature. */
  first: string | null
  /** A espécie que dá a 2ª feature. */
  second: string | null
}

export type Character = {
  id: string
  schema: number
  name: string
  createdAt: number
  updatedAt: number

  /**
   * A imagem do personagem, por endereço. `null` é ficha sem imagem.
   *
   * Endereço e não arquivo: a ficha sobe inteira para o banco a cada gravação
   * e viaja no código de compartilhamento — um `data:` aqui levaria a imagem
   * junto, em toda escrita.
   */
  avatarUrl: string | null

  heritage: Heritage
  community: string | null
  className: string | null
  subclass: string | null
  level: Level

  /**
   * Os seis valores a distribuir pelos atributos. `null` é o array do livro
   * — `STARTING_TRAIT_ARRAY`.
   *
   * Guardado porque com a regra da casa ele é **sorteado**, e sorteio tem de
   * acontecer uma vez: derivá-lo a cada render daria um personagem diferente
   * a cada abertura da ficha.
   */
  traitArray: readonly number[] | null

  /** Só o valor base — o que foi distribuído. O final sai de `derive`. */
  traits: TraitValues

  marks: Marks
  tokens: readonly TokenCount[]

  loadout: readonly string[]
  vault: readonly string[]
  inventory: readonly InventoryEntry[]

  /**
   * A party a que a ficha pertence, ou `null`. Campo, e nao entidade a parte,
   * porque a relacao e 1:N de verdade — ver `types/party.ts`.
   */
  partyId: string | null

  /**
   * Regras da casa **desta ficha**. Valem quando ela não está numa mesa; em
   * mesa, valem as da mesa, lidas ao vivo — ver `effectiveHouseRules`. Nascem
   * do modelo do perfil e se editam com Salvar.
   */
  houseRules: HouseRules

  /** Histórico, não resumo: dá para mostrar a progressão e desfazer o último nível. */
  /**
   * O que as features pediram por escrito, por chave de campo.
   *
   * Mapa e não lista porque a resposta pertence à **feature**, não à posição:
   * trocar de origem não pode empurrar os tenets do Orderborne para a feature
   * que entrou no lugar. Ver `helpers/featurePrompt.ts`.
   */
  featureNotes: Readonly<Record<string, string>>

  advancements: readonly Advancement[]
  experiences: readonly Experience[]
  notes: string
}

/** Regras da casa. Escolha da mesa: vivem na ficha e na mesa, e o perfil guarda o modelo de ficha nova. */
export type HouseRules = {
  hasTwoCardsPerLevel: boolean
  hasEvasionFromTraits: boolean
  roundsEvasionUp: boolean
  loadoutSize: "5" | "3+tier" | "4+tier"
  /** Multiclasse já no Tier 2, gastando os dois advancements do nível. */
  allowsEarlyMulticlass: boolean
  /** Dano físico, energético e térmico no lugar de `phy`/`tech`. */
  hasGranularDamageTypes: boolean
  /** Toda arma aceita augments em Tier + 1 slots. */
  hasCustomWeapons: boolean
  /** O array de atributos é sorteado em vez de ser o do livro. */
  hasRolledTraitArray: boolean
}

/** Armadura equipada, já resolvida contra a linha e o tier. */
export type EquippedArmor = {
  entryId: string
  name: string
  line: string
  tier: Tier
  baseScore: number
  majorBase: number
  severeBase: number
  /** Nomes em `features`: o da linha e o da peça, quando existem. */
  features: readonly string[]
}

/**
 * Tudo que é calculado. Nada aqui é gravado.
 * Cada campo é `ResolvedStat` para que a UI mostre base, modificadores e total.
 */
export type DerivedStats = {
  level: Level
  tier: Tier
  traits: Record<Trait, ResolvedStat>
  proficiency: ResolvedStat
  evasion: ResolvedStat
  armorScore: ResolvedStat
  hitPointsMax: ResolvedStat
  stressMax: ResolvedStat
  majorThreshold: ResolvedStat
  severeThreshold: ResolvedStat
  loadoutMax: ResolvedStat
  /** Cartas esperadas no nível atual, conforme a regra da casa. */
  expectedCards: number
  /** Quantas Experiences o nível concede — e quantas cabem na ficha. */
  expectedExperiences: number
  /** As Experiences da ficha, cada uma com o bônus já resolvido. */
  experiences: readonly ResolvedExperience[]
  equippedArmor: EquippedArmor | null
  /** Sem armadura vestida: Armor Score 0, Major = nível, Severe = 2 × nível. */
  isUnarmored: boolean
  /** Sem armadura e com a carta Bare Bones no Loadout: vale a base da carta. */
  hasBareBones: boolean
  /**
   * O atributo de Forcewielding (o Spellcast trait do livro), vindo da
   * subclasse. `null` quando a subclasse não tem, ou não há subclasse.
   */
  spellcastTrait: Trait | null
}
