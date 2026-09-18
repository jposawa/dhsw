import { Chip } from "@jposawa/ronin-ui"
import clsx from "clsx"

import { LOADOUT_SIZE_OPTIONS } from "@/constants"
import type { BaseComponent, HouseRules } from "@/types"

import { HouseRuleToggle } from "./HouseRuleToggle"

import styles from "./HouseRulesForm.module.css"

type HouseRulesFormProps = BaseComponent & {
  value: HouseRules
  /** Sem ele, o formulário é só leitura — em mesa, quem ajusta é o Narrador. */
  onChange?: (next: HouseRules) => void
}

/**
 * As regras da casa, com o efeito de cada uma escrito embaixo do nome.
 *
 * Um formulário para três lugares: o modelo do perfil, a ficha e a mesa. Quem
 * usa decide quando gravar — o formulário só devolve o valor novo.
 */
export const HouseRulesForm = ({ value, onChange, className, style }: HouseRulesFormProps) => {
  const isReadOnly = onChange === undefined

  const change = (patch: Partial<HouseRules>) => {
    onChange?.({ ...value, ...patch })
  }

  return (
    <section className={clsx(styles.form, className)} style={style} aria-label="Regras da casa">
      <HouseRuleToggle
        isOn={value.hasTwoCardsPerLevel}
        isDisabled={isReadOnly}
        title="Duas cartas de domínio por nível"
        description="O padrão é uma por nível, além das duas da criação. No nível 10 você conhece 20 em vez de 11. O loadout segue limitando o que está em jogo, então o ganho é de vault, não de poder por cena."
        onToggle={() => change({ hasTwoCardsPerLevel: !value.hasTwoCardsPerLevel })}
      />

      <HouseRuleToggle
        isOn={value.hasEvasionFromTraits}
        isDisabled={isReadOnly}
        title="Evasion escala com (Agility + Instinct) ÷ 2"
        description="Sem esta regra a Evasion só sobe por advancement. Ligando, os dois atributos valem dobrado e ficam quase obrigatórios — no fim pode somar +5 ou +6, mais que a distância entre a classe mais e a menos evasiva."
        onToggle={() => change({ hasEvasionFromTraits: !value.hasEvasionFromTraits })}
      />

      {value.hasEvasionFromTraits ? (
        <div className={styles.chips}>
          <Chip
            label="Arredondar para baixo"
            isActive={!value.roundsEvasionUp}
            disabled={isReadOnly}
            onToggle={() => change({ roundsEvasionUp: false })}
          />
          <Chip
            label="Para cima"
            isActive={value.roundsEvasionUp}
            disabled={isReadOnly}
            onToggle={() => change({ roundsEvasionUp: true })}
          />
        </div>
      ) : null}

      <article className={styles.loadout}>
        <h3 className={styles.title}>Tamanho do loadout</h3>
        <p className={styles.note}>
          O padrão é 5 fixo. <b>3 + Tier</b> dá 4/5/6/7: troca aperto no começo por folga no
          fim. <b>4 + Tier</b> dá 5/6/7/8, nunca pior que o padrão — aumento puro.
        </p>
        <div className={styles.chips}>
          {LOADOUT_SIZE_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              isActive={value.loadoutSize === option.value}
              disabled={isReadOnly}
              onToggle={() => change({ loadoutSize: option.value })}
            />
          ))}
        </div>
      </article>

      <HouseRuleToggle
        isOn={value.allowsEarlyMulticlass}
        isDisabled={isReadOnly}
        title="Multiclasse já no Tier 2"
        description="Pela regra, multiclasse abre no nível 5. Ligando, abre no nível 2 — e continua custando os dois advancements do nível. O domínio novo segue limitado a metade do nível."
        onToggle={() => change({ allowsEarlyMulticlass: !value.allowsEarlyMulticlass })}
      />

      <HouseRuleToggle
        isOn={value.hasGranularDamageTypes}
        isDisabled={isReadOnly}
        title="Tipos de dano: físico, energético e térmico"
        description="No lugar de phy e tech. Blaster e lâmina de plasma são energéticos; lâmina, projétil e punho, físicos; fogo e explosivo, térmicos. Serve para resistências como Plasma Resistant."
        onToggle={() => change({ hasGranularDamageTypes: !value.hasGranularDamageTypes })}
      />

      <HouseRuleToggle
        isOn={value.hasCustomWeapons}
        isDisabled={isReadOnly}
        title="Armas customizáveis"
        description="Arma com Customizable (n) aceita n + 1 augments, no molde do Ikonis. Cada augment exige um Tier mínimo do personagem e, instalado, vale como feature a mais da arma."
        onToggle={() => change({ hasCustomWeapons: !value.hasCustomWeapons })}
      />
    </section>
  )
}
