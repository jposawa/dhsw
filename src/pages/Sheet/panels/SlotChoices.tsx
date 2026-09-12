import { Button } from "@jposawa/ronin-ui"

import type { InventoryEntry } from "@/types"

import styles from "./SlotChoices.module.css"

type SlotChoicesProps = {
  candidates: readonly InventoryEntry[]
  equippedId: string | null
  describe: (entry: InventoryEntry) => string
  onChoose: (entryId: string | null) => void
}

/**
 * O que pode ocupar um slot, dentro da gaveta de troca.
 *
 * `onChoose(null)` esvazia o slot: é o "tirar" da peça que já está em uso, e
 * fica no mesmo lugar da escolha porque é a mesma decisão — o que eu estou
 * usando aqui.
 *
 * A descrição vem de fora em vez de ser remontada aqui: quem sabe traduzir uma
 * linha de inventário em "Finesse · Close · d8" é o painel, que já faz isso na
 * mochila, e duas versões da mesma frase divergiriam.
 */
export const SlotChoices = ({
  candidates,
  equippedId,
  describe,
  onChoose,
}: SlotChoicesProps) => {
  if (candidates.length === 0) {
    return (
      <p className={styles.empty}>
        Nada na mochila serve para este slot. Pegue equipamento primeiro.
      </p>
    )
  }

  return (
    <ul className={styles.list}>
      {candidates.map((entry) => (
        <li className={styles.row} key={entry.id}>
          <div className={styles.text}>
            <h4 className={styles.name}>{entry.name}</h4>
            <p className={styles.meta}>{describe(entry)}</p>
          </div>

          {entry.id === equippedId ? (
            <Button variant="outline" onClick={() => onChoose(null)}>
              TIRAR
            </Button>
          ) : (
            <Button onClick={() => onChoose(entry.id)}>USAR</Button>
          )}
        </li>
      ))}
    </ul>
  )
}
