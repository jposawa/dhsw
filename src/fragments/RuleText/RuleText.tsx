import clsx from "clsx"

import { parseBlocks } from "@/helpers"
import type { BaseComponent, InlineToken } from "@/types"

import styles from "./RuleText.module.css"

const renderTokens = (tokens: readonly InlineToken[]) =>
  tokens.map((token, index) => {
    if (token.kind === "strong") {
      return (
        <strong className={styles.strong} key={index}>
          {token.value}
        </strong>
      )
    }

    if (token.kind === "emphasis") {
      return (
        <em className={styles.emphasis} key={index}>
          {token.value}
        </em>
      )
    }

    return <span key={index}>{token.value}</span>
  })

type RuleTextProps = BaseComponent & {
  text: string
}

/**
 * Texto de regra: carta, feature de classe, de espécie, de origem, de arma.
 *
 * É o único lugar que lê o markdown mínimo do compêndio. Passar o texto cru
 * para dentro de um `<p>` era o que fazia `**Force Absorption**` chegar à tela
 * com os asteriscos — o dado tem marcação, e quem não a lê imprime.
 *
 * O titulo sai como `<strong>` num `<p>`, e nao como `<h4>`: uma carta aparece
 * em lista, em grade e dentro de um `Collapse`, cada um com um nivel de
 * cabecalho diferente ao redor — escolher um aqui acertaria num lugar e
 * quebraria a ordem do documento nos outros. A sub-habilidade e rotulo visual,
 * nao secao do documento.
 */
export const RuleText = ({ text, className, style }: RuleTextProps) => (
  <div className={clsx(styles.body, className)} style={style}>
    {parseBlocks(text).map((block, index) => {
      if (block.kind === "list") {
        return (
          <ul key={index}>
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>{renderTokens(item)}</li>
            ))}
          </ul>
        )
      }

      if (block.kind === "heading") {
        return (
          <p className={styles.heading} key={index}>
            {renderTokens(block.tokens)}
          </p>
        )
      }

      return <p key={index}>{renderTokens(block.tokens)}</p>
    })}
  </div>
)
