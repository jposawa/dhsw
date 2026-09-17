/**
 * As quatro abas da ficha, um arquivo cada — e Combate em dois, porque os
 * modos dela não compartilham nem um campo: em mesa é marcador e leitura, em
 * edição é formulário.
 *
 * Não são páginas nem componentes reutilizáveis: são as partes de uma tela só,
 * e existem separados porque a divisão entre "grava no toque" e "só grava no
 * Salvar" é a decisão central da ficha.
 */
export { CardsPanel } from "./CardsPanel"
export { CombatEdit } from "./CombatEdit"
export { CombatPlay } from "./CombatPlay"
export { HistoryPanel } from "./HistoryPanel"
export { InventoryPanel } from "./InventoryPanel"
