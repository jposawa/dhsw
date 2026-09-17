import { Chip } from "@jposawa/ronin-ui"
import { useAtom } from "jotai"

import { StepRule } from "@/components"
import { LOADOUT_SIZE_OPTIONS } from "@/constants"
import { houseRulesAtom } from "@/states"

import { HouseRuleToggle } from "./HouseRuleToggle"

import styles from "./HouseRules.module.css"

/**
 * Regras da casa. Valem para a mesa toda e viajam junto no código de
 * compartilhamento — não são config remota nem regra do SRD. Ver CONFIG.md.
 */
export const HouseRules = () => {
  const [houseRules, setHouseRules] = useAtom(houseRulesAtom)

  return (
    <main className={styles.page}>
      <StepRule />

      <HouseRuleToggle
        isOn={houseRules.hasTwoCardsPerLevel}
        title="Duas cartas de domínio por nível"
        description="O padrão é uma por nível, além das duas da criação. No nível 10 você conhece 20 em vez de 11. O loadout segue limitando o que está em jogo, então o ganho é de vault, não de poder por cena."
        onToggle={() =>
          setHouseRules({
            ...houseRules,
            hasTwoCardsPerLevel: !houseRules.hasTwoCardsPerLevel,
          })
        }
      />

      <HouseRuleToggle
        isOn={houseRules.hasEvasionFromTraits}
        title="Evasion escala com (Agility + Instinct) ÷ 2"
        description="Sem esta regra a Evasion só sobe por advancement. Ligando, os dois atributos valem dobrado e ficam quase obrigatórios — no fim pode somar +5 ou +6, mais que a distância entre a classe mais e a menos evasiva."
        onToggle={() =>
          setHouseRules({
            ...houseRules,
            hasEvasionFromTraits: !houseRules.hasEvasionFromTraits,
          })
        }
      />

      {houseRules.hasEvasionFromTraits ? (
        <div className={styles.chips}>
          <Chip
            label="Arredondar para baixo"
            isActive={!houseRules.roundsEvasionUp}
            onToggle={() => setHouseRules({ ...houseRules, roundsEvasionUp: false })}
          />
          <Chip
            label="Para cima"
            isActive={houseRules.roundsEvasionUp}
            onToggle={() => setHouseRules({ ...houseRules, roundsEvasionUp: true })}
          />
        </div>
      ) : null}

      <article className={styles.loadout}>
        <h3 className={styles.title}>Tamanho do loadout</h3>
        <p className={styles.note}>
          O padrão é 5 fixo. <b>3 + Tier</b> dá 4/5/6/7: troca aperto no começo por folga
          no fim. <b>4 + Tier</b> dá 5/6/7/8, nunca pior que o padrão — aumento puro.
        </p>
        <div className={styles.chips}>
          {LOADOUT_SIZE_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              isActive={houseRules.loadoutSize === option.value}
              onToggle={() => setHouseRules({ ...houseRules, loadoutSize: option.value })}
            />
          ))}
        </div>
      </article>

      <HouseRuleToggle
        isOn={houseRules.allowsEarlyMulticlass}
        title="Multiclasse já no Tier 2"
        description="Pela regra, multiclasse abre no nível 5. Ligando, abre no nível 2 — e continua custando os dois advancements do nível. O domínio novo segue limitado a metade do nível."
        onToggle={() =>
          setHouseRules({ ...houseRules, allowsEarlyMulticlass: !houseRules.allowsEarlyMulticlass })
        }
      />

      <HouseRuleToggle
        isOn={houseRules.hasGranularDamageTypes}
        title="Tipos de dano: físico, energético e térmico"
        description="No lugar de phy e tech. Blaster e lâmina de plasma são energéticos; lâmina, projétil e punho, físicos; fogo e explosivo, térmicos. Serve para resistências como Plasma Resistant."
        onToggle={() =>
          setHouseRules({ ...houseRules, hasGranularDamageTypes: !houseRules.hasGranularDamageTypes })
        }
      />

      <HouseRuleToggle
        isOn={houseRules.hasCustomWeapons}
        title="Armas customizáveis"
        description="Arma com Customizable (n) aceita n + 1 augments, no molde do Ikonis. Cada augment exige um Tier mínimo do personagem e, instalado, vale como feature a mais da arma."
        onToggle={() => setHouseRules({ ...houseRules, hasCustomWeapons: !houseRules.hasCustomWeapons })}
      />
    </main>
  )
}
