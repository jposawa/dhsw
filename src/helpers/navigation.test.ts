import { describe, expect, it } from 'vitest'

import type { HomeConfig, NavItem } from '@/types'

import { resolveHomePath, resolveNavItems } from './navigation'

const CATALOGUE: readonly NavItem[] = [
  {
    key: 'compendium',
    label: 'COMPÊNDIO',
    icon: '◈',
    path: '/compendio',
    needAuth: false,
    active: true,
    order: 0,
  },
  {
    key: 'roster',
    label: 'FICHAS',
    icon: '◐',
    path: '/fichas',
    needAuth: true,
    active: true,
    order: 1,
  },
  {
    key: 'houseRules',
    label: 'REGRAS',
    icon: '⚙',
    path: '/regras',
    needAuth: false,
    active: true,
    order: 2,
  },
]

const FALLBACK: HomeConfig = { authenticated: 'roster', anonymous: 'compendium' }

describe('resolveNavItems', () => {
  it('esconde o que exige conta de quem nao entrou', () => {
    const keys = resolveNavItems(CATALOGUE, {}, false).map((item) => item.key)

    expect(keys).toEqual(['compendium', 'houseRules'])
  })

  it('mostra tudo para quem entrou', () => {
    const keys = resolveNavItems(CATALOGUE, {}, true).map((item) => item.key)

    expect(keys).toEqual(['compendium', 'roster', 'houseRules'])
  })

  it('a config desliga um item', () => {
    const keys = resolveNavItems(CATALOGUE, { houseRules: { active: false } }, true).map(
      (item) => item.key,
    )

    expect(keys).toEqual(['compendium', 'roster'])
  })

  it('a config reordena', () => {
    const keys = resolveNavItems(CATALOGUE, { houseRules: { order: -1 } }, true).map(
      (item) => item.key,
    )

    expect(keys).toEqual(['houseRules', 'compendium', 'roster'])
  })

  it('a config renomeia', () => {
    const [first] = resolveNavItems(CATALOGUE, { compendium: { label: 'CARTAS' } }, true)

    expect(first.label).toBe('CARTAS')
  })

  it('chave desconhecida na config e ignorada, nao cria item', () => {
    const keys = resolveNavItems(
      CATALOGUE,
      { naoExiste: { active: true, order: 0 } },
      true,
    ).map((item) => item.key)

    expect(keys).toEqual(['compendium', 'roster', 'houseRules'])
  })

  it('config nao vence needAuth: ligar o roster nao o mostra para anonimo', () => {
    const keys = resolveNavItems(CATALOGUE, { roster: { active: true } }, false).map(
      (item) => item.key,
    )

    expect(keys).not.toContain('roster')
  })
})

describe('resolveHomePath', () => {
  it('usa a config quando ela serve', () => {
    const home: HomeConfig = { authenticated: 'houseRules', anonymous: 'houseRules' }

    expect(resolveHomePath(CATALOGUE, home, FALLBACK, true)).toBe('/regras')
    expect(resolveHomePath(CATALOGUE, home, FALLBACK, false)).toBe('/regras')
  })

  it('cai no padrao do codigo quando a chave nao existe', () => {
    const home: HomeConfig = { authenticated: 'naoExiste', anonymous: 'naoExiste' }

    expect(resolveHomePath(CATALOGUE, home, FALLBACK, true)).toBe('/fichas')
    expect(resolveHomePath(CATALOGUE, home, FALLBACK, false)).toBe('/compendio')
  })

  it('recusa destino com conta para quem nao entrou', () => {
    // Config apontando anonimo para o roster mandaria a pessoa para o portao
    // de login — o oposto do que a home por sessao existe para fazer.
    const home: HomeConfig = { authenticated: 'roster', anonymous: 'roster' }

    expect(resolveHomePath(CATALOGUE, home, FALLBACK, false)).toBe('/compendio')
  })

  it('destino fora do menu continua valido: active nao decide rota', () => {
    const hidden = CATALOGUE.map((item) =>
      item.key === 'houseRules' ? { ...item, active: false } : item,
    )
    const home: HomeConfig = { authenticated: 'houseRules', anonymous: 'houseRules' }

    expect(resolveHomePath(hidden, home, FALLBACK, true)).toBe('/regras')
  })

  it('com padrao do codigo tambem quebrado, pega o primeiro servivel', () => {
    const home: HomeConfig = { authenticated: 'naoExiste', anonymous: 'naoExiste' }
    const broken: HomeConfig = { authenticated: 'tambemNao', anonymous: 'tambemNao' }

    expect(resolveHomePath(CATALOGUE, home, broken, false)).toBe('/compendio')
    expect(resolveHomePath(CATALOGUE, home, broken, true)).toBe('/compendio')
  })

  it('devolve null quando nao ha destino servivel', () => {
    const onlyPrivate = CATALOGUE.filter((item) => item.needAuth)
    const home: HomeConfig = { authenticated: 'roster', anonymous: 'roster' }

    expect(resolveHomePath(onlyPrivate, home, FALLBACK, false)).toBeNull()
  })
})
