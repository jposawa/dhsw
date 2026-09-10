/**
 * Primitivos de UI.
 *
 * A maioria vem de `@jposawa/ronin-ui` e é reexportada aqui de propósito: o
 * barril continua sendo o endereço único (`@/components`), então trocar a
 * origem de um primitivo é uma linha neste arquivo, não uma varredura pelas
 * telas. STRUCTURE.md.
 *
 * Ficam locais só os que a biblioteca não tem porque são deste domínio:
 * `Pip` (marcador de HP/Stress/Armor, com alvo de 44px) e `StepRule` (a régua
 * escalonada, que é assinatura visual e não componente genérico).
 */
export {
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  Collapse,
  Drawer,
  Input,
  Modal,
  Section,
  SectionLabel,
  Stepper,
  Tabs,
  Tooltip,
} from '@jposawa/ronin-ui'

export { Pip } from './Pip'
export { StepRule } from './StepRule'
export { DomainSymbol } from './DomainSymbol'
export { NavIcon } from './NavIcon'
export { Switch } from './Switch'
