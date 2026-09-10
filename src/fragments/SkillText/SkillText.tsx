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

export const SkillText = ({ text, className, style }: SkillTextProps) => (
  <div className={[styles.body, className].filter(Boolean).join(" ")} style={style}>
    {parseBlocks(text).map((block, index) =>
      block.kind === "list" ? (
        <ul key={index}>
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderTokens(item)}</li>
          ))}
        </ul>
      ) : (
        <p key={index}>{renderTokens(block.tokens)}</p>
      ),
    )}
  </div>
)
