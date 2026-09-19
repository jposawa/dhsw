import { Button, Input, Modal } from "@jposawa/ronin-ui"
import React from "react"

import { toImageUrl } from "@/helpers"

import styles from "./PortraitDrawer.module.css"

type PortraitLinkModalProps = {
  /** O endereço atual, ou `null` para abrir vazio. Lido ao abrir. */
  avatarUrl: string | null
  isOpen: boolean
  onConfirm: (avatarUrl: string | null) => void
  onClose: () => void
}

/**
 * Colar o endereço da imagem.
 *
 * Um modal e não um campo sempre aberto: pôr link é tarefa de um passo com um
 * fim claro, e um campo ao lado do retrato convida a mexer quem só veio olhar.
 *
 * O botão de confirmar **é** o Salvar deste dado — nada aqui grava enquanto se
 * digita, nem no modo jogo, onde o resto da ficha grava no toque.
 */
export const PortraitLinkModal = ({
  avatarUrl,
  isOpen,
  onConfirm,
  onClose,
}: PortraitLinkModalProps) => {
  const [draft, setDraft] = React.useState(avatarUrl ?? "")

  const next = toImageUrl(draft)
  // Campo vazio é "tirar a imagem" e vale confirmar; texto que não é endereço
  // não vale, e o botão fica apagado em vez de gravar lixo.
  const isUsable = draft.trim() === "" || next !== null

  return (
    <Modal
      isOpen={isOpen}
      title="Imagem do personagem"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            CANCELAR
          </Button>
          <Button disabled={!isUsable} onClick={() => onConfirm(next)}>
            {next ? "USAR IMAGEM" : "TIRAR IMAGEM"}
          </Button>
        </>
      }
    >
      <div className={styles.form}>
        <Input
          label="ENDEREÇO DA IMAGEM"
          value={draft}
          placeholder="https://…"
          maxLength={500}
          errorMessage={isUsable ? undefined : "Precisa ser um endereço http ou https."}
          onValueChange={setDraft}
        />
        <p className={styles.note}>
          O app guarda o endereço, não o arquivo: a imagem continua onde está, e some daqui se
          sair de lá. Campo vazio tira o retrato.
        </p>
      </div>
    </Modal>
  )
}
