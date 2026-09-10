import type { BaseComponent, NavIconName } from '@/types'

import styles from './NavIcon.module.css'
import { NAV_ICON_ART } from './symbols'

type NavIconProps = BaseComponent & {
  name: NavIconName
  /**
   * Rótulo para leitor de tela. Sem ele o ícone é decorativo e sai da árvore
   * de acessibilidade — que é o certo na navegação, onde o nome do destino já
   * é o texto do link, inclusive quando o trilho está recolhido e o rótulo
   * acessível passa para o próprio link.
   */
  label?: string
}

/**
 * Um ícone da navegação.
 *
 * A cor **não** é decidida aqui: o traço é `currentColor`, então o ícone segue
 * o estado do item que o contém — apagado, em foco ou marcando a página atual.
 * Fixar cor aqui exigiria uma prop por estado e as duas listas divergiriam.
 *
 * O tamanho vem do `font-size` do contexto (`1em`), o mesmo que o rótulo ao
 * lado usa. É o que faz o ícone crescer junto ao passar da barra inferior para
 * o trilho sem uma prop de tamanho.
 */
export const NavIcon = ({ name, label, className, style }: NavIconProps) => (
  <svg
    className={[styles.icon, className].filter(Boolean).join(' ')}
    style={style}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    role={label ? 'img' : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
    data-testid={`nav-icon-${name}`}
  >
    {NAV_ICON_ART[name]}
  </svg>
)
