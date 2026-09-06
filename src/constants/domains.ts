import type { DamageType, Domain, Range, Trait, WeaponBurden } from '@/types'

/**
 * Valores do vocabulario de dominio. As unioes vivem em `types/domain.ts`;
 * aqui so os valores, tipados contra elas — divergencia quebra o build.
 */

export const DOMAIN_LIST: readonly Domain[] = [
  'Aegis',
  'Allure',
  'Edge',
  'Essence',
  'Havoc',
  'Veil',
]

export const TRAIT_LIST: readonly Trait[] = [
  'Agility',
  'Strength',
  'Finesse',
  'Instinct',
  'Presence',
  'Knowledge',
]

export const RANGE_LIST: readonly Range[] = [
  'Melee',
  'Very Close',
  'Close',
  'Far',
  'Very Far',
]

export const DAMAGE_TYPE_LIST: readonly DamageType[] = ['phy', 'tech']

export const WEAPON_BURDEN_LIST: readonly WeaponBurden[] = [
  'Uma mão',
  'Duas mãos',
  'Secundária',
]
