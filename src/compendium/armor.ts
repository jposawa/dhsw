// GERADO POR scripts/build-compendium.ts — NÃO EDITAR À MÃO.
// Fonte: specs/dh-sw.html
import type { ArmorLine, NamedArmor } from '@/types'

export const ARMOR_LINES: readonly ArmorLine[] = [
  {
    "name": "Flexible",
    "evasionLabel": "+1 Evasion",
    "tiers": [
      {
        "baseScore": 3,
        "majorBase": 5,
        "severeBase": 11
      },
      {
        "baseScore": 4,
        "majorBase": 7,
        "severeBase": 16
      },
      {
        "baseScore": 5,
        "majorBase": 9,
        "severeBase": 23
      },
      {
        "baseScore": 6,
        "majorBase": 11,
        "severeBase": 32
      }
    ]
  },
  {
    "name": "Neutra",
    "evasionLabel": "—",
    "tiers": [
      {
        "baseScore": 3,
        "majorBase": 6,
        "severeBase": 13
      },
      {
        "baseScore": 4,
        "majorBase": 9,
        "severeBase": 20
      },
      {
        "baseScore": 5,
        "majorBase": 11,
        "severeBase": 27
      },
      {
        "baseScore": 6,
        "majorBase": 13,
        "severeBase": 36
      }
    ]
  },
  {
    "name": "Heavy",
    "evasionLabel": "−1 Evasion",
    "tiers": [
      {
        "baseScore": 4,
        "majorBase": 7,
        "severeBase": 15
      },
      {
        "baseScore": 5,
        "majorBase": 11,
        "severeBase": 24
      },
      {
        "baseScore": 6,
        "majorBase": 13,
        "severeBase": 31
      },
      {
        "baseScore": 7,
        "majorBase": 15,
        "severeBase": 40
      }
    ]
  },
  {
    "name": "Very Heavy",
    "evasionLabel": "−2 Evasion, −1 Agility",
    "tiers": [
      {
        "baseScore": 4,
        "majorBase": 8,
        "severeBase": 17
      },
      {
        "baseScore": 5,
        "majorBase": 13,
        "severeBase": 28
      },
      {
        "baseScore": 6,
        "majorBase": 15,
        "severeBase": 35
      },
      {
        "baseScore": 7,
        "majorBase": 17,
        "severeBase": 44
      }
    ]
  }
] as const

export const NAMED_ARMOR: readonly NamedArmor[] = [
  {
    "name": "Padded Flightsuit",
    "line": "Flexible",
    "tier": 1,
    "feature": null
  },
  {
    "name": "Reinforced Flightsuit",
    "line": "Flexible",
    "tier": 2,
    "feature": null
  },
  {
    "name": "Nightscale Weave",
    "line": "Flexible",
    "tier": 3,
    "feature": null
  },
  {
    "name": "Shadowsilk Weave",
    "line": "Flexible",
    "tier": 4,
    "feature": null
  },
  {
    "name": "Smuggler's Vest",
    "line": "Neutra",
    "tier": 1,
    "feature": null
  },
  {
    "name": "Scout Armor",
    "line": "Neutra",
    "tier": 2,
    "feature": null
  },
  {
    "name": "Hunter's Rig",
    "line": "Neutra",
    "tier": 3,
    "feature": null
  },
  {
    "name": "Vanguard Rig",
    "line": "Neutra",
    "tier": 4,
    "feature": null
  },
  {
    "name": "Trooper Plate",
    "line": "Heavy",
    "tier": 1,
    "feature": null
  },
  {
    "name": "Heavy Trooper Plate",
    "line": "Heavy",
    "tier": 2,
    "feature": null
  },
  {
    "name": "Assault Plate",
    "line": "Heavy",
    "tier": 3,
    "feature": null
  },
  {
    "name": "Siege Plate",
    "line": "Heavy",
    "tier": 4,
    "feature": null
  },
  {
    "name": "Siege Carapace",
    "line": "Very Heavy",
    "tier": 1,
    "feature": null
  },
  {
    "name": "Powered Carapace",
    "line": "Very Heavy",
    "tier": 2,
    "feature": null
  },
  {
    "name": "Exoframe",
    "line": "Very Heavy",
    "tier": 3,
    "feature": null
  },
  {
    "name": "Warframe Exoframe",
    "line": "Very Heavy",
    "tier": 4,
    "feature": null
  },
  {
    "name": "Jedi Robes",
    "line": "Flexible",
    "tier": 2,
    "feature": "Não conta como armadura para efeitos que exigem estar sem armadura."
  },
  {
    "name": "Beskar'gam",
    "line": "Neutra",
    "tier": 3,
    "feature": "`Lightblade Resistant`."
  },
  {
    "name": "Cortosis Plate",
    "line": "Heavy",
    "tier": 4,
    "feature": "`Lightblade Resistant`. Uma vez por rest, anule o dano de um ataque de sabre."
  },
  {
    "name": "Powered Exoskeleton",
    "line": "Very Heavy",
    "tier": 3,
    "feature": "Sem a penalidade de Evasion enquanto houver célula de energia."
  }
] as const
