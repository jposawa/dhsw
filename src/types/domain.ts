/**
 * Vocabulario do dominio. Tipos declarados como uniao literal, sem derivar de
 * `as const` — `types/` e folha e nao importa de `constants/`.
 *
 * O valor correspondente vive em `constants/domains.ts`, tipado contra estas
 * unioes: se um lado divergir do outro, o compilador acusa.
 */

export type Domain = 'Aegis' | 'Allure' | 'Edge' | 'Essence' | 'Havoc' | 'Veil'

export type Trait =
  | 'Agility'
  | 'Strength'
  | 'Finesse'
  | 'Instinct'
  | 'Presence'
  | 'Knowledge'

export type Range = 'Melee' | 'Very Close' | 'Close' | 'Far' | 'Very Far'

/** `tech` no lugar de "magic" — regra oficial do SRD. dh-sw-v2-spec.md §1.4. */
export type DamageType = 'phy' | 'tech'

export type WeaponBurden = 'Uma mão' | 'Duas mãos' | 'Secundária'

/** Nivel de carta e de personagem: 1–10. */
export type Level = number

/** Derivado do nivel, nunca guardado. 1 / 2–4 / 5–7 / 8–10. */
export type Tier = 1 | 2 | 3 | 4
