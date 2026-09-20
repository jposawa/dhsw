import { Button, SectionLabel } from "@jposawa/ronin-ui";
import React from "react";

import { DotScale } from "@/components";
import {
	EQUIP_SLOTS,
	HOPE_MAX,
	MAX_PROFICIENCY,
	TRAIT_LIST,
	TRAIT_VERBS,
} from "@/constants";
import { MarkerTrack, RuleText, StatBlock, ThresholdBar } from "@/fragments";
import {
	activeTokenPools,
	describeThresholdOrigin,
	domainColorToken,
	formatSigned,
	heritageLabel,
	ok,
	presetForTrait,
	setTokenCount,
	toImageUrl,
	tokenCount,
} from "@/helpers";
import { useCompendium } from "@/hooks";
import type {
	Character,
	DerivedStats,
	DicePreset,
	EquipSlot,
	Marks,
	Result,
} from "@/types";

import { ActiveWeapon } from "./ActiveWeapon";
import { EquippedArmorCard } from "./EquippedArmorCard";
import { FeatureNotes } from "./FeatureNotes";
import { IdentityFeatures } from "./IdentityFeatures";
import { PortraitDrawer } from "./PortraitDrawer";
import { RestDrawer } from "./RestDrawer";
import { TokenCounter } from "./TokenCounter";

import styles from "./CombatPlay.module.css";

type CombatPlayProps = {
	character: Character;
	derived: DerivedStats;
	isReadOnly: boolean;
	onMarksChange: (marks: Marks) => void;
	onApply: (result: Result<Character>) => void;
	/** Abre o rolador já preparado. O rolador é da ficha inteira, não desta aba. */
	onPrepareRoll: (preset: DicePreset | null) => void;
};

/**
 * A ficha em mesa.
 *
 * **A ordem é a das perguntas da mesa**, e cada bloco encosta no que responde:
 *
 * 1. Quem é — nome, classe, nível. Uma faixa fina; identifica, não se usa.
 * 2. **Defesa**: Evasion e os Armor Slots lado a lado — gastar slot é reduzir
 *    o dano que acabou de chegar. O Armor Score está em Equipamento.
 * 3. **Atributos** com os verbos da ficha do livro: "rola o quê para pular?"
 *    se responde olhando, sem decorar a lista.
 * 4. **Dano, vida e Hope juntos**: a régua de thresholds em cima do HP, porque
 *    a pergunta real é "levei 11, marco quanto?", e Hope colado em HP e Stress
 *    porque são os três marcadores tocados no mesmo turno.
 * 5. **Hope feature e Experiences** — os dois jeitos de gastar Hope.
 * 6. **Equipamento**: armas com Proficiency já nos dados, e a armadura com o
 *    Armor Score e as features.
 * 7. **Features** de classe, subclasse, espécie e origem — consulta, não toque,
 *    por isso por último e na largura inteira.
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
	onPrepareRoll,
}: CombatPlayProps) => {
	const { compendium } = useCompendium();
	const [isResting, setIsResting] = React.useState(false);

	const classDefinition = compendium.classes.find(
		(candidate) => candidate.name === character.className,
	);
	const lineage = [
		character.className,
		character.subclass,
		heritageLabel(character),
		character.community,
	]
		.filter(Boolean)
		.join(" · ");

	const equippedIn = (slot: EquipSlot) =>
		character.inventory.find(
			(entry) => entry.isEquipped && entry.slot === slot,
		);

	const weaponOf = (slot: EquipSlot) => {
		const entry = equippedIn(slot);

		return entry
			? compendium.weapons.find((candidate) => candidate.name === entry.name)
			: undefined;
	};

	const isPrimaryTwoHanded = weaponOf("primary")?.burden === "Duas mãos";

	const needsClass = classDefinition === undefined;

	const tokenPools = activeTokenPools(character, derived, compendium);


	const renderTokens = (key: string) => {
		const active = tokenPools.find((candidate) => candidate.key === key);

		return active ? (
			<TokenCounter
				active={active}
				count={tokenCount(character, active)}
				onChange={(next) =>
					onApply(setTokenCount(character, key, next, derived, compendium))
				}
			/>
		) : null;
	};

	// Endereço inválido não vira `<img>`: ficaria o ícone de imagem quebrada.
	const portrait = toImageUrl(character.avatarUrl ?? "");
	const [isPortraitOpen, setIsPortraitOpen] = React.useState(false);

	return (
		<div className={styles.layout}>
			<header className={styles.identity}>
				{/* O retrato pequeno é identificação; quem quer ver o personagem toca e
            abre a gaveta, onde ele cabe inteiro. */}
				{!!portrait && (
					<button
						type="button"
						className={styles.portraitButton}
						aria-label={`Ver o retrato de ${character.name || "Sem nome"}`}
						onClick={() => setIsPortraitOpen(true)}
					>
						<img
							className={styles.portrait}
							src={portrait}
							alt=""
							loading="lazy"
							onError={(event) => {
								// Endereço que morreu não deixa buraco na ficha: o retrato some
								// e o resto do cabeçalho continua igual.
								event.currentTarget.hidden = true;
							}}
						/>
					</button>
				)}

				<hgroup className={styles.identityText}>
					<h2 className={styles.name}>{character.name || "Sem nome"}</h2>
					<p className={styles.lineage}>{lineage || "ficha em branco"}</p>
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
				</hgroup>

				<aside className={styles.identitySide}>
					{/* {hasCombatRefill && (
						<Switch
							className={styles.combatSwitch}
							isOn={isInCombat}
							disabled={isReadOnly}
							onToggle={toggleCombat}
						>
							EM COMBATE
						</Switch>
					)} */}
					{/* Rolar é da ficha inteira e mora na faixa de cima, junto do
              estado de gravação: aqui ele existia só nesta aba, e trocar de
              aba para rolar era o caminho mais comprido do app. */}
					{/* No cabeçalho e em texto: descanso acontece entre cenas, poucas vezes
              por sessão, e não disputa espaço com os pips que se tocam no turno. */}
					<Button
						className={styles.restButton}
						variant="outline"
						disabled={isReadOnly}
						onClick={() => setIsResting(true)}
					>
						DESCANSAR
					</Button>
				</aside>
			</header>

			{!!needsClass && (
				<p className={styles.notice}>
					Sem classe, não há Evasion nem Hit Points. Escolha a classe em Editar
					ficha.
				</p>
			)}

			<section className={styles.defense} aria-label="Defesa">
				<StatBlock label="EVASION" stat={derived.evasion} />

				{/* Os slots no lugar do número: o Armor Score está no card da armadura,
            em Equipamento, e aqui fica o que se toca ao receber dano. */}
				<MarkerTrack
					className={styles.armorSlots}
					label="ARMOR SLOTS"
					hasCount
					rows={3}
					marked={character.marks.armor}
					max={derived.armorScore.total}
					color={domainColorToken("Edge")}
					emptyText="Sem armadura: nenhum slot para marcar."
					onChange={(armorMarks) =>
						onMarksChange({ ...character.marks, armor: armorMarks })
					}
				/>
			</section>

			<section className={styles.traits} aria-label="Atributos">
				<ul className={styles.traitList}>
					{TRAIT_LIST.map((trait) => (
						<li
							className={styles.trait}
							key={trait}
							data-spellcast={derived.spellcastTrait === trait || undefined}
						>
							{/* O atributo inteiro é o botão: tocar prepara a rolagem dele. */}
							<button
								type="button"
								className={styles.traitButton}
								aria-label={`Rolar ${trait}, ${formatSigned(derived.traits[trait].total)}`}
								onClick={() => onPrepareRoll(presetForTrait(trait, derived))}
							>
								<span className={styles.traitName}>{trait}</span>
								<b className={styles.traitValue}>
									{formatSigned(derived.traits[trait].total)}
								</b>
								<span className={styles.traitVerbs}>
									{TRAIT_VERBS[trait].join(" · ")}
								</span>
								{derived.spellcastTrait === trait && (
									<span className={styles.spellcast}>FORCEWIELDING</span>
								)}
							</button>
						</li>
					))}
				</ul>
			</section>

			<section className={styles.vitals} aria-label="Dano, vida e Hope">
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
				<MarkerTrack
					label="HOPE"
					hasCount
					marked={character.marks.hope}
					max={HOPE_MAX}
					color={domainColorToken("Aegis")}
					onChange={(hope) => onMarksChange({ ...character.marks, hope })}
				/>
				<p className={styles.hint}>
					Gaste uma Hope para usar uma Experience ou ajudar um aliado.
				</p>
			</section>

			<section className={styles.hope}>
				{!!classDefinition && (
					<>
						<SectionLabel>
							<h3>HOPE FEATURE</h3>
						</SectionLabel>
						<RuleText
							className={styles.hopeFeature}
							text={classDefinition.hopeFeature}
						/>
					</>
				)}

				<SectionLabel detail={String(character.experiences.length)}>
					<h3>EXPERIENCES</h3>
				</SectionLabel>

				{character.experiences.length === 0 ? (
					<p className={styles.empty}>Nenhuma. Adicione em Editar ficha.</p>
				) : (
					<ul className={styles.experiences}>
						{/* O bônus vem resolvido: o +2 de nascença mais o que os
						    avanços somaram. A ficha guarda só a base. */}
						{derived.experiences.map((experience) => (
							<li className={styles.experience} key={experience.name}>
								<span className={styles.experienceName}>{experience.name}</span>
								<b className={styles.experienceBonus}>
									+{experience.bonus.total}
								</b>
							</li>
						))}
					</ul>
				)}
			</section>

			<FeatureNotes className={styles.featureNotes} character={character} />

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
					<h3>EQUIPAMENTO</h3>
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
							derived={derived}
							onPrepareRoll={onPrepareRoll}
							emptyText={
								slot.id === "secondary" && isPrimaryTwoHanded
									? "A primária é de duas mãos."
									: "Nada empunhado — escolha no Inventário."
							}
						/>
					))}
					<EquippedArmorCard derived={derived} />
				</ul>
			</section>

			<IdentityFeatures
				className={styles.features}
				character={character}
				renderTokens={renderTokens}
			/>

			{/* Editável também em mesa: o botão de confirmar do modal é o Salvar
          deste dado, então nada grava enquanto se digita. */}
			<PortraitDrawer
				isOpen={isPortraitOpen}
				name={character.name}
				avatarUrl={character.avatarUrl}
				onChange={(avatarUrl) => onApply(ok({ ...character, avatarUrl }))}
				onClose={() => setIsPortraitOpen(false)}
			/>

			<RestDrawer
				isOpen={isResting}
				character={character}
				derived={derived}
				onApply={onApply}
				onClose={() => setIsResting(false)}
			/>
		</div>
	);
};
