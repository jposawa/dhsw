import { Chip } from "@jposawa/ronin-ui"
import { useAtom } from "jotai"

import { Pip, StepRule } from "@/components"
import type { HouseRules as HouseRulesType } from "@/types"
import { houseRulesAtom } from "@/states"

import styles from "./HouseRules.module.css"

const LOADOUT_OPTIONS: readonly { value: HouseRulesType["loadoutSize"]; label: string }[] = [
  { value: "5", label: "5 fixo" },
  { value: "3+tier", label: "3 + Tier" },
  { value: "4+tier", label: "4 + Tier" },
]

type ToggleProps = {
  isOn: boolean
  title: string
  description: string
  onToggle: () => void
}

const Toggle = ({ isOn, title, description, onToggle }: ToggleProps) => (
  <div className={styles.block}>
    <Pip isMarked={isOn} label={title} onToggle={onToggle} />
    <div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.note}>{description}</p>
    </div>
  </div>
)

/**
 * Regras da casa. Valem para a mesa toda e viajam junto no código de
 * compartilhamento — não são config remota nem regra do SRD. Ver CONFIG.md.
 */
export const HouseRules = () => {
  const [houseRules, setHouseRules] = useAtom(houseRulesAtom)

  return (
    <main className={styles.page}>
      <StepRule />

      <Toggle
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

      <Toggle
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

      <div className={styles.block}>
        <div>
          <h3 className={styles.title}>Tamanho do loadout</h3>
          <p className={styles.note}>
            O padrão é 5 fixo. <b>3 + Tier</b> dá 4/5/6/7: troca aperto no começo por folga
            no fim. <b>4 + Tier</b> dá 5/6/7/8, nunca pior que o padrão — aumento puro.
          </p>
          <div className={styles.chips}>
            {LOADOUT_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                isActive={houseRules.loadoutSize === option.value}
                onToggle={() => setHouseRules({ ...houseRules, loadoutSize: option.value })}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
