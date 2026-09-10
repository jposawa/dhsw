/**
 * Navegacao.
 *
 * A divisao entre codigo e config e a mesma do fantraveller: o **catalogo**
 * (o que existe) vive no codigo, porque cada destino precisa de uma rota e de
 * uma pagina; a **visibilidade e a ordem** vem da config remota, porque mudam
 * sem deploy. Ver CONFIG.md.
 */

/**
 * Ícones da navegação. União literal porque o valor não é texto livre: cada
 * nome precisa ter arte desenhada em `components/NavIcon`, e o compilador é
 * quem garante que um item do catálogo não aponte para ícone inexistente.
 */
export type NavIconName = "compendium" | "roster" | "parties" | "houseRules" | "account"

export type NavItem = {
  /** Chave estavel. E por ela que a config remota referencia o item. */
  key: string
  label: string
  /**
   * Nome do ícone, desenhado em `components/NavIcon` — não um glifo.
   *
   * Era um caractere Unicode, para não arrastar uma biblioteca de ícones. A
   * biblioteca continua fora: a arte é local, no mesmo traço dos emblemas de
   * domínio. O que mudou é que `◈ ◐ ◎ ⚙` não se distinguiam entre si no
   * trilho recolhido, onde o ícone é tudo o que resta do item.
   *
   * Continua sendo **dado**, e não componente: o catálogo se mistura com a
   * config remota, que precisa ser serializável.
   */
  icon: NavIconName
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
