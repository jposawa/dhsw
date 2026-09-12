/**
 * Os primitivos **deste** projeto, e só eles.
 *
 * O que vem de `@jposawa/ronin-ui` é importado da biblioteca no ponto de uso.
 * Reexportar dali daria a `@/components` um endereço para código que não é
 * nosso: quem lesse `import { Button } from "@/components"` iria procurar o
 * Button nesta pasta e não o acharia, e a dependência de terceiro sumiria da
 * lista de imports de toda tela. STRUCTURE.md pede o barril por pasta — não
 * um barril que se apresenta como dono do que reexporta.
 */
export { DomainLabel } from "./DomainLabel"
export { DomainSymbol } from "./DomainSymbol"
export { NavIcon } from "./NavIcon"
export { Pip } from "./Pip"
export { StepRule } from "./StepRule"
export { Switch } from "./Switch"
