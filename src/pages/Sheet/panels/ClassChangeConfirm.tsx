import { Button, Modal } from "@jposawa/ronin-ui"

import type { ClassChangeLoss } from "@/types"

import styles from "./Identity.module.css"

type ClassChangeConfirmProps = {
  targetClass: string | null
  loss: ClassChangeLoss
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Trocar de classe apaga o que dependia dela. O aviso diz o quê, com número:
 * "resetaria muita coisa" não deixa ninguém decidir.
 *
 * Mesmo confirmada, a troca só vai para o rascunho — CANCELAR na barra de
 * baixo ainda devolve tudo.
 */
export const ClassChangeConfirm = ({
  targetClass,
  loss,
  onConfirm,
  onCancel,
}: ClassChangeConfirmProps) => (
  <Modal
    isOpen={targetClass !== null}
    isPersistent
    title={`Trocar para ${targetClass ?? ""}?`}
    onClose={onCancel}
    footer={
      <>
        <Button variant="outline" onClick={onCancel}>
          MANTER A CLASSE
        </Button>
        <Button intent="danger" onClick={onConfirm}>
          TROCAR
        </Button>
      </>
    }
  >
    <section className={styles.confirm}>
      <p className={styles.confirmText}>A troca desfaz o que vinha da classe atual:</p>
      <ul className={styles.lossList}>
        {loss.subclass ? (
          <li>
            a subclasse <b>{loss.subclass}</b>, com as features dela
          </li>
        ) : null}
        {loss.cardCount > 0 ? (
          <li>
            <b>{loss.cardCount}</b> {loss.cardCount === 1 ? "carta" : "cartas"} de domínio, do
            loadout e do vault
          </li>
        ) : null}
      </ul>
      <p className={styles.confirmText}>
        Nível, atributos, advancements, inventário e Experiences ficam. Nada é gravado até SALVAR.
      </p>
    </section>
  </Modal>
)
