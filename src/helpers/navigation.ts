import type { HomeConfig, NavItem, NavItemOverride } from "@/types"

/**
 * Composição do menu e da página inicial. Puro — a UI só renderiza.
 *
 * Tudo aqui trata a config remota como **entrada não confiável**: ela é
 * editada fora do repositório, sem revisão e sem deploy. Um valor errado não
 * pode quebrar a navegação; no pior caso o app cai no padrão do código.
 */

/** Catálogo + override da config + sessão → o que a barra mostra, na ordem. */
export const resolveNavItems = (
  catalogue: readonly NavItem[],
  overrides: Readonly<Record<string, NavItemOverride>>,
  isSignedIn: boolean,
): NavItem[] =>
  catalogue
    .map((item) => {
      const override = overrides[item.key]

      return {
        ...item,
        active: override?.active ?? item.active,
        order: override?.order ?? item.order,
        label: override?.label ?? item.label,
      }
    })
    .filter((item) => item.active && (!item.needAuth || isSignedIn))
    .sort((first, second) => first.order - second.order)

/**
 * Chave do catálogo → caminho, se ela servir para este estado de sessão.
 *
 * Duas recusas, e as duas importam:
 *
 * - **chave desconhecida** — a config aponta para algo que não existe. O
 *   catálogo garante que toda chave conhecida tem rota; fora dele, não há
 *   garantia nenhuma.
 * - **destino que exige conta, para quem não entrou** — mandaria a pessoa
 *   para o portão de login em vez da parte pública, que é exatamente o que
 *   a página inicial por sessão existe para evitar.
 *
 * `active` **não** é consultado de propósito: ele governa a barra, não a
 * existência da rota. Uma página fora do menu continua sendo destino válido.
 */
const pathForKey = (
  catalogue: readonly NavItem[],
  key: string,
  isSignedIn: boolean,
): string | null => {
  const item = catalogue.find((candidate) => candidate.key === key)

  if (!item) {
    return null
  }

  if (item.needAuth && !isSignedIn) {
    return null
  }

  return item.path
}

/**
 * Para onde `/` manda.
 *
 * Ordem: config remota → padrão do código → primeiro destino servível do
 * catálogo. O último degrau existe para o caso em que alguém renomeia uma
 * chave do catálogo e esquece do padrão: sem ele, `/` ficaria sem destino e
 * a raiz do app quebraria por causa de um `rename`.
 */
export const resolveHomePath = (
  catalogue: readonly NavItem[],
  home: HomeConfig,
  fallback: HomeConfig,
  isSignedIn: boolean,
): string | null => {
  const configured = isSignedIn ? home.authenticated : home.anonymous
  const byConfig = pathForKey(catalogue, configured, isSignedIn)

  if (byConfig) {
    return byConfig
  }

  const defaulted = isSignedIn ? fallback.authenticated : fallback.anonymous
  const byCode = pathForKey(catalogue, defaulted, isSignedIn)

  if (byCode) {
    return byCode
  }

  const firstServable = catalogue.find((item) => !item.needAuth || isSignedIn)

  return firstServable?.path ?? null
}
