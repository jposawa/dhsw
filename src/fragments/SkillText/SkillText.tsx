import clsx from "clsx"

import { parseBlocks } from "@/helpers"
import type { BaseComponent, InlineToken } from "@/types"

import styles from "./SkillText.module.css"

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

type SkillTextProps = BaseComponent & {
  text: string
}

/**
 * O texto de uma carta.
 *
 * O titulo sai como `<strong>` num `<p>`, e nao como `<h4>`: uma carta aparece
 * em lista, em grade e dentro de um `Collapse`, cada um com um nivel de
 * cabecalho diferente ao redor — escolher um aqui acertaria num lugar e
 * quebraria a ordem do documento nos outros. A sub-habilidade e rotulo visual,
 * nao secao do documento.
 */
export const SkillText = ({ text, className, style }: SkillTextProps) => (
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
