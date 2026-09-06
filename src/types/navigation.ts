/**
 * Navegacao.
 *
 * A divisao entre codigo e config e a mesma do fantraveller: o **catalogo**
 * (o que existe) vive no codigo, porque cada destino precisa de uma rota e de
 * uma pagina; a **visibilidade e a ordem** vem da config remota, porque mudam
 * sem deploy. Ver CONFIG.md.
 */

export type NavItem = {
  /** Chave estavel. E por ela que a config remota referencia o item. */
  key: string
  label: string
  /** Glifo do proto. Texto, nao componente: nao arrasta uma lib de icones. */
  icon: string
  path: string
  /** Some para quem nao entrou. */
  needAuth: boolean
  /** Padrao do codigo; a config remota pode desligar ou religar. */
  active: boolean
  order: number
}

/** O que a config remota pode sobrescrever por chave. Nada alem disto. */
export type NavItemOverride = {
  active?: boolean
  order?: number
  label?: string
}

/**
 * Para onde `/` manda, por estado de sessao.
 *
 * Os valores sao **chaves do catalogo**, nao caminhos. Chave amarra ao
 * catalogo, e o catalogo garante que a rota existe; caminho solto na config
 * seria um jeito de apontar a pagina inicial para o nada.
 */
export type HomeConfig = {
  authenticated: string
  anonymous: string
}
