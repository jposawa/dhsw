// GERADO POR scripts/build-compendium.ts — NÃO EDITAR À MÃO.
// Fonte: specs/dh-sw.html
import type { ClassDefinition } from "@/types"

export const CLASSES: readonly ClassDefinition[] = [
  {
    "name": "Adept",
    "evasion": 10,
    "hitPoints": 6,
    "domains": [
      "Essence",
      "Aegis"
    ],
    "subclasses": [
      "Warden",
      "Augur"
    ],
    "baseFeatures": "Determination Dice; Force Patterns;",
    "hopeFeature": "**Force Absorption** — Gaste 3 Hope para reduzir em um degrau a severidade de um dano recebido, sem marcar Armor Slot.",
    "previousEvasion": 10,
    "previousHopeFeature": "Spend 3 Hope to avoid marking your last Hit Point.",
    "hopeFeatureRationale": "A v1 dava “evite marcar seu último Hit Point” — negação passiva de morte, sem análogo no SRD. Todas as nove Hope features do SRD são ativas."
  },
  {
    "name": "Agent",
    "evasion": 12,
    "hitPoints": 6,
    "domains": [
      "Edge",
      "Veil"
    ],
    "subclasses": [
      "Operative",
      "Infiltrator"
    ],
    "baseFeatures": "Hide; Flank Attack;",
    "hopeFeature": "**Opening** — Gaste 3 Hope ao acertar um Flank Attack para somar 3D6 ao dano desse ataque.",
    "previousEvasion": 12,
    "previousHopeFeature": "Spend 3 Hope to increase your Flank Attack damage. Until your next Short Rest, you add 3D6 to each Flank Attack damage roll.",
    "hopeFeatureRationale": "A v1 aplicava +3D6 a *todo* Flank Attack até o próximo descanso — média de +10,5 por acerto, repetível. Fora de escala."
  },
  {
    "name": "Conduit",
    "evasion": 10,
    "hitPoints": 5,
    "domains": [
      "Essence",
      "Havoc"
    ],
    "subclasses": [
      "Keeper",
      "Wayseeker"
    ],
    "baseFeatures": "Combat Maneuvers; Raw Channel;",
    "hopeFeature": "**Volatile Force** — Gaste 3 Hope para rerrolar quantos dados de dano quiser num ataque que cause dano de Força ou `tech`.",
    "previousEvasion": 10,
    "previousHopeFeature": "Spend 3 Hope to reroll any number of your Damage Dice on an attack.",
    "hopeFeatureRationale": "Igual ao Volatile Magic do Sorcerer, que restringe a dano mágico. A v1 não restringia nada."
  },
  {
    "name": "Envoy",
    "evasion": 9,
    "hitPoints": 6,
    "domains": [
      "Veil",
      "Allure"
    ],
    "subclasses": [
      "Conciliator",
      "Investigator"
    ],
    "baseFeatures": "Kindle; Holding Gaze;",
    "hopeFeature": "**Leverage** — Gaste 3 Hope para dar vantagem na próxima rolagem de um aliado dentro de Close e limpar um Stress dele.",
    "previousEvasion": 9,
    "previousHopeFeature": "Spend 3 Hope after a Roll to double the result of your Hope die.",
    "hopeFeatureRationale": "A v1 dobrava o Hope die *depois* de ver o resultado — oscilação de +1 a +12 aplicada retroativamente, sem análogo."
  },
  {
    "name": "Outrider",
    "evasion": 10,
    "hitPoints": 6,
    "domains": [
      "Edge",
      "Allure"
    ],
    "subclasses": [
      "Tracker",
      "Pathfinder"
    ],
    "baseFeatures": "Target Lock; Ship Expertise;",
    "hopeFeature": "**Evasive Line** — Gaste 3 Hope para ganhar +2 de Evasion — sua ou da nave que você pilota — até o próximo ataque acertar você, ou até o próximo rest.",
    "previousEvasion": 10,
    "previousHopeFeature": "Spend 3 Hope and increase your Evasion, or the Evasion of a ship you’re Piloting, by +1 until your next Short Rest.",
    "hopeFeatureRationale": "Alinhado ao Rogue's Dodge: bônus maior, mas com condição de quebra. A extensão para a nave é identidade sua e fica."
  },
  {
    "name": "Soldier",
    "evasion": 9,
    "hitPoints": 7,
    "domains": [
      "Aegis",
      "Havoc"
    ],
    "subclasses": [
      "Juggernaut",
      "Marshal"
    ],
    "baseFeatures": "Implacable; Combat Training;",
    "hopeFeature": "**Frontline** — Gaste 3 Hope para limpar 2 Armor Slots.",
    "previousEvasion": 7,
    "previousHopeFeature": "Spend 3 Hope to clear up to 3 Armor Slots.",
    "hopeFeatureRationale": "Era 3 slots. O Guardian, que tem os mesmos domínios, limpa 2."
  }
] as const
