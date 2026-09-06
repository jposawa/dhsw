import { useAtomValue } from 'jotai'
import React from 'react'

import { NAV_ITEMS } from '@/constants'
import { resolveNavItems } from '@/helpers'
import { authAtom } from '@/states'
import type { NavItem } from '@/types'

import { useConfig } from './useConfig'

/**
 * Menu = catalogo do codigo + override da config + sessao.
 *
 * A composicao vive em `helpers/navigation.ts`, com teste. Aqui so a ligacao
 * com o estado.
 */
export const useNavItems = (): NavItem[] => {
  const { status } = useAtomValue(authAtom)
  const { config } = useConfig()

  return React.useMemo(
    () => resolveNavItems(NAV_ITEMS, config.menuItems, status === 'signed-in'),
    [config.menuItems, status],
  )
}
