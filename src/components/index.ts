/**
 * Os primitivos **deste** projeto, e só eles.
 *
 * O que vem de `@jposawa/ronin-ui` é importado da biblioteca no ponto de uso.
 * Reexportar dali daria a `@/components` um endereço para código que não é
 * nosso: quem lesse `import { Button } from "@/components"` iria procurar o
 * Button nesta pasta e não o acharia, e a dependência de terceiro sumiria da
 * lista de imports de toda tela.
 *
 * `export *` e não o nome: cada pasta exporta um componente e já o nomeia no
 * barril dela. Repetir o nome aqui é escrevê-lo duas vezes, e as duas cópias
 * divergem no dia em que uma mudar.
 */
export * from "./Die"
export * from "./DieControl"
export * from "./DieShape"
export * from "./DomainLabel"
export * from "./DomainSymbol"
export * from "./DotScale"
export * from "./Icon"
export * from "./Pip"
export * from "./StepRule"
export * from "./Switch"
