import { SectionLabel } from "@jposawa/ronin-ui"

import type { Character } from "@/types"

import styles from "./HistoryPanel.module.css"

type HistoryPanelProps = {
  character: Character
  isEditing: boolean
  onChange: (mutate: (current: Character) => Character) => void
}

/**
 * As anotações da ficha.
 *
 * As Experiences saíram daqui: elas se usam em mesa — gastar uma Hope para
 * somar o bônus, no meio de um teste —, então se leem na aba principal e se
 * editam lá. Ficar nesta aba punha a lista longe de onde ela serve.
 *
 * **Nada aqui é jogada.** Um campo de anotação que grava a cada tecla enche o
 * histórico de versões com meia frase, e é exatamente o tipo de dado que não
 * pode sumir por um toque errado — por isso passa pelo Salvar.
 */
export const HistoryPanel = ({ character, isEditing, onChange }: HistoryPanelProps) => (
  <div className={styles.layout}>
    <section className={styles.notesBlock}>
      <SectionLabel>
        <h3>ANOTAÇÕES</h3>
      </SectionLabel>

      {isEditing ? (
        <textarea
          className={styles.notes}
          value={character.notes}
          rows={12}
          placeholder="Quem é, de onde veio, com quem tem conta a acertar."
          aria-label="Anotações"
          onChange={(event) =>
            onChange((current) => ({ ...current, notes: event.target.value }))
          }
        />
      ) : character.notes.trim() ? (
        <p className={styles.notesRead}>{character.notes}</p>
      ) : (
        <p className={styles.empty}>Sem anotações. Entre em Editar ficha para escrever.</p>
      )}
    </section>
  </div>
)
