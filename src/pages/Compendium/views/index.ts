/**
 * Os seis segmentos do compêndio.
 *
 * Cada um é a tela de um `Outlet` da página, não uma página por conta própria:
 * a moldura, a régua e a rota-pai são do `Compendium`. Por isso moram numa
 * subpasta dele e não em `pages/` — um segmento sem a página não é nada.
 */
export { CompendiumAncestries } from "./Ancestries"
export { CompendiumCards } from "./Cards"
export { CompendiumClasses } from "./Classes"
export { CompendiumCommunities } from "./Communities"
export { CompendiumDomains } from "./Domains"
export { CompendiumGear } from "./Gear"
