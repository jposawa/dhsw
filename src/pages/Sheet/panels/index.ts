/**
 * Os dois modos da ficha, um arquivo cada.
 *
 * Não são páginas nem componentes reutilizáveis: são as duas metades de uma
 * tela só, e existem separados porque a divisão entre "grava no toque" e "só
 * grava no Salvar" é a decisão central da ficha — deixá-la implícita num
 * `mode === "edit"` espalhado por trezentas linhas era o que fazia o formulário
 * e os marcadores se misturarem.
 */
export { EditPanel } from "./EditPanel"
export { PlayPanel } from "./PlayPanel"
