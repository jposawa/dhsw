// GERADO POR scripts/build-compendium.ts — NÃO EDITAR À MÃO.
// Fonte: specs/dh-sw.html
import type { CompendiumEntry } from "@/types"

export const CONSUMABLES: readonly CompendiumEntry[] = [
  {
    "name": "Stimpack",
    "tier": 1,
    "text": "Limpe 1d4 **Hit Points**."
  },
  {
    "name": "Bacta Patch",
    "tier": 1,
    "text": "Limpe um **Hit Point**. Se usado durante um rest, limpe dois."
  },
  {
    "name": "Ration Cube",
    "tier": 1,
    "text": "Durante um rest, limpe um **Stress** adicional. Tem gosto de nada."
  },
  {
    "name": "Smoke Canister",
    "tier": 1,
    "text": "Área *Very Close* fica obscurecida por uma cena. Ataques que atravessam têm *disadvantage*."
  },
  {
    "name": "Adrenal Booster",
    "tier": 1,
    "text": "Sua próxima rolagem tem vantagem. Depois, marque um **Stress**."
  },
  {
    "name": "Antitoxin Vial",
    "tier": 1,
    "text": "Anule um veneno, gás ou toxina afetando você ou um aliado em *Melee*."
  },
  {
    "name": "Ion Grenade",
    "tier": 2,
    "text": "Todos os droides e sistemas em *Very Close* marcam 2 **Hit Points** e ficam *Vulnerable*."
  },
  {
    "name": "Thermal Detonator",
    "tier": 2,
    "text": "Alvos em *Very Close* sofrem 3d10 de dano `tech`. Você também, se não sair."
  },
  {
    "name": "Kolto Vial",
    "tier": 2,
    "text": "Limpe 1d4+1 **Hit Points** ou todos os seus **Stress**. Escolha na hora de usar."
  },
  {
    "name": "Slicer Spike",
    "tier": 2,
    "text": "Abre um terminal ou porta sem rolagem. Queima ao usar e deixa registro."
  },
  {
    "name": "Flash Charge",
    "tier": 2,
    "text": "Alvos em *Close* que possam ver ficam *Vulnerable* até o fim do próximo turno deles."
  },
  {
    "name": "Binder Cuffs",
    "tier": 2,
    "text": "Um alvo derrotado ou disposto fica contido até alguém gastar uma ação para soltar."
  },
  {
    "name": "Deflector Cell",
    "tier": 3,
    "text": "Pela próxima cena, marque Armor Slots sem gastá-los contra dano `tech`."
  },
  {
    "name": "Medpac",
    "tier": 3,
    "text": "Você ou um aliado em *Melee* limpa 1d6+2 **Hit Points**."
  },
  {
    "name": "Kyber Shard",
    "tier": 3,
    "text": "Material de upgrade da trilha Kyber. Não se compra."
  },
  {
    "name": "Concussion Charge",
    "tier": 3,
    "text": "Alvos em *Close* sofrem 4d10 de dano `phy` e são empurrados para *Far*."
  },
  {
    "name": "Nano Medfield",
    "tier": 4,
    "text": "Todos os aliados em *Close* limpam 1d4 **Hit Points**."
  },
  {
    "name": "Overcharge Cell",
    "tier": 4,
    "text": "Sua próxima rolagem de dano com arma `tech` rola os dados duas vezes: fique com o melhor."
  }
] as const
