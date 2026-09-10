import { useAtom } from 'jotai'
import { NavLink } from 'react-router-dom'

import { NavIcon } from '@/components'
import { useNavItems } from '@/hooks'
import { isNavCollapsedAtom } from '@/states'

import { UserMenu } from '../UserMenu'

import styles from './BottomNav.module.css'

/**
 * Navegação principal: barra inferior no celular, trilho vertical à esquerda
 * no desktop.
 *
 * A troca é só de eixo, e é só CSS — a partir de 900px, o mesmo ponto em que o
 * conteúdo passa a ser centralizado. Não há árvore alternativa de navegação
 * para telas grandes: duas listas divergiriam, e a ordem dos destinos é
 * decisão da config remota, não do layout. Ver `BottomNav.module.css`.
 *
 * Os destinos vem de `useNavItems`: catalogo no codigo, visibilidade e ordem
 * na config remota, e o que exige conta some para quem nao entrou.
 *
 * A conta e o ultimo item e nao passa pelo catalogo: ela nao e destino, e o
 * gatilho de um painel — e, deslogada, e o botao de entrar. Ver `UserMenu`.
 */
export const BottomNav = () => {
  const navItems = useNavItems()
  const [isCollapsed, setIsCollapsed] = useAtom(isNavCollapsedAtom)

  return (
    <nav
      className={styles.nav}
      aria-label="Navegação principal"
      data-collapsed={isCollapsed}
      data-testid="main-nav"
    >
      {/* Só existe no trilho: o CSS o esconde na barra inferior, onde não há
          o que recolher. Fica antes dos destinos para que o Tab o alcance
          primeiro — é o controle que muda a forma de tudo abaixo dele. */}
      <button
        type="button"
        className={styles.collapseToggle}
        aria-expanded={!isCollapsed}
        aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
        data-testid="nav-collapse-toggle"
        onClick={() => setIsCollapsed((collapsed) => !collapsed)}
      >
        <i className={styles.collapseIcon} aria-hidden="true">
          {isCollapsed ? '»' : '«'}
        </i>
      </button>

      {navItems.map((item) => (
        <NavLink
          key={item.key}
          to={item.path}
          className={styles.item}
          data-testid={`nav-item-${item.key}`}
          // Recolhido sobra só o ícone, que é decorativo: sem isto o link
          // ficaria sem nome acessível.
          title={isCollapsed ? item.label : undefined}
          aria-label={isCollapsed ? item.label : undefined}
        >
          <i className={styles.icon} aria-hidden="true">
            <NavIcon name={item.icon} />
          </i>
          <span className={styles.label}>{item.label}</span>
        </NavLink>
      ))}

      <UserMenu isNavCollapsed={isCollapsed} />
    </nav>
  )
}
