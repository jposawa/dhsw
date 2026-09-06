import { NavLink } from 'react-router-dom'

import { useNavItems } from '@/hooks'

import { UserMenu } from '../UserMenu'

import styles from './BottomNav.module.css'

/**
 * Barra inferior, na zona do polegar.
 *
 * Os destinos vem de `useNavItems`: catalogo no codigo, visibilidade e ordem
 * na config remota, e o que exige conta some para quem nao entrou.
 *
 * A conta e o ultimo item e nao passa pelo catalogo: ela nao e destino, e o
 * gatilho de um painel — e, deslogada, e o botao de entrar. Ver `UserMenu`.
 */
export const BottomNav = () => {
  const navItems = useNavItems()

  return (
    <nav className={styles.nav} aria-label="Navegação principal">
      {navItems.map((item) => (
        <NavLink key={item.key} to={item.path} className={styles.item}>
          <i className={styles.icon} aria-hidden="true">
            {item.icon}
          </i>
          {item.label}
        </NavLink>
      ))}

      <UserMenu />
    </nav>
  )
}
