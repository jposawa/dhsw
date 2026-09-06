/**
 * Compendio: dado imutavel, gerado. Nao vai para o Realtime Database — e
 * conteudo versionado com o codigo. Ver BACKEND.md.
 *
 * So dado e indice aqui. Funcao de busca vive em `helpers/search.ts`, e a
 * composicao das duas em `hooks/useSkillSearch.ts`.
 */
import { CLASSES } from './classes'
import { SKILLS } from './skills'
import { SUBCLASSES } from './subclasses'

export { ANCESTRIES } from './ancestries'
export { ARMOR_LINES, NAMED_ARMOR } from './armor'
export { CLASSES } from './classes'
export { COMMUNITIES } from './communities'
export { CONSUMABLES } from './consumables'
export { DOMAIN_DEFINITIONS } from './domains'
export { ITEMS } from './items'
export { SKILLS, SKILL_SEARCH_INDEX } from './skills'
export { SUBCLASSES } from './subclasses'
export { WEAPONS } from './weapons'

/* Indices montados uma vez na importacao do modulo, nao a cada render. */

export const SKILLS_BY_NAME: ReadonlyMap<string, (typeof SKILLS)[number]> = new Map(
  SKILLS.map((skill) => [skill.name, skill]),
)

export const CLASSES_BY_NAME: ReadonlyMap<string, (typeof CLASSES)[number]> = new Map(
  CLASSES.map((klass) => [klass.name, klass]),
)

export const SUBCLASSES_BY_CLASS: ReadonlyMap<string, (typeof SUBCLASSES)[number][]> =
  SUBCLASSES.reduce((byClass, subclass) => {
    byClass.set(subclass.className, [...(byClass.get(subclass.className) ?? []), subclass])

    return byClass
  }, new Map<string, (typeof SUBCLASSES)[number][]>())
