import type { HomeConfig, NavItemOverride } from "./navigation"

/**
 * Config remota, lida de `/dhsw/<env>/config`. Ver CONFIG.md.
 *
 * O que entra aqui muda **sem deploy**. O que precisa de codigo novo para
 * funcionar nao entra — ligar uma flag para uma tela que nao existe so
 * produz link quebrado.
 */
export type RemoteConfig = {
  isCompendiumSearchEnabled: boolean
  minimumSupportedSchema: number
  announcement: string | null
  /**
   * Sobrescreve visibilidade e ordem do menu, por chave do catalogo em
   * `constants/appNav.ts`. Chave desconhecida e ignorada.
   */
  menuItems: Readonly<Record<string, NavItemOverride>>
  /** Destino de `/` por estado de sessao. Ver CONFIG.md. */
  home: HomeConfig
}

/**
 * Em que pe esta a config.
 *
 * `default` nao e "vazio": e o padrao do codigo, que ja e config valida.
 * O app abre e funciona nele — o remoto e override, nao requisito.
 */
export type ConfigStatus = "default" | "loading" | "loaded" | "error"
