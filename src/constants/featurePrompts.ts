import type { FeaturePrompt } from "@/types"

/**
 * A rede, enquanto o compêndio não declara.
 *
 * **O lugar certo disto é `data/compendium`**, no campo `prompts` da espécie
 * ou da origem — e é lá que o app procura primeiro. Esta lista existe para o
 * app não ficar esperando a edição do conteúdo, e para servir de exemplo do
 * formato. Em `communities.json`:
 *
 *     {
 *       "name": "Orderborne",
 *       "feature": "**Dedicated** — Registre três ditados ou valores…",
 *       "prompts": [{ "feature": "Dedicated", "count": 3, "label": "Ditado" }]
 *     }
 *
 * `feature` é o nome **em negrito** no começo do texto da feature — o mesmo
 * recorte que a ficha usa para intitulá-la. `count` é quantas linhas e `label`
 * o singular, que a tela numera: "Ditado 1", "Ditado 2".
 *
 * Assim que a coleção trouxer `prompts`, o registro correspondente daqui pode
 * sair: o do compêndio ganha sozinho.
 */
export const FALLBACK_FEATURE_PROMPTS: readonly FeaturePrompt[] = [
  /* Orderborne: "Registre três ditados ou valores da sua criação." */
  { feature: "Dedicated", count: 3, label: "Ditado" },
  /* Adept: "escolha um número de 1 a 12" no descanso longo. O resto da
     feature — ganhar Hope ou limpar Stress ao rolar aquele número — a mesa
     resolve na mão; o que a ficha precisa guardar é o número. */
  { feature: "Force Patterns", count: 1, label: "Número escolhido", min: 1, max: 12 },
]
