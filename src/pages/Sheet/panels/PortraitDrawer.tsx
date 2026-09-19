import { Button } from "@jposawa/ronin-ui"
import React from "react"
import { LuImage, LuPencil } from "react-icons/lu"

import { WideDrawer } from "@/fragments"
import { toImageUrl } from "@/helpers"

import { PortraitLinkModal } from "./PortraitLinkModal"

import styles from "./PortraitDrawer.module.css"

type PortraitDrawerProps = {
  isOpen: boolean
  name: string
  avatarUrl: string | null
  /** Ausente em ficha de leitor: aí a gaveta só mostra. */
  onChange?: (avatarUrl: string | null) => void
  onClose: () => void
}

/**
 * O retrato em tamanho de olhar, e a troca do endereço.
 *
 * No cabeçalho ele é pequeno de propósito — a ficha em mesa não tem altura a
 * gastar com ilustração. Quem quer *ver* o personagem toca nele e chega aqui.
 *
 * Trocar abre um modal por cima, e não um campo solto na gaveta: colar link é
 * uma tarefa de um passo com um fim claro, e um campo sempre aberto ao lado da
 * imagem convida a mexer em quem só veio olhar.
 */
export const PortraitDrawer = ({
  isOpen,
  name,
  avatarUrl,
  onChange,
  onClose,
}: PortraitDrawerProps) => {
  const [isLinking, setIsLinking] = React.useState(false)

  const portrait = toImageUrl(avatarUrl ?? "")

  return (
    <WideDrawer
      className={styles.drawer}
      isOpen={isOpen}
      title={name || "Sem nome"}
      onClose={onClose}
    >
      <section className={styles.body} aria-label="Retrato">
        {portrait ? (
          <img className={styles.portrait} src={portrait} alt={`Retrato de ${name || "Sem nome"}`} />
        ) : (
          <p className={styles.empty}>
            <LuImage aria-hidden="true" />
            Sem imagem. O app guarda o endereço de uma imagem que já esteja na web — não há upload.
          </p>
        )}

        {onChange ? (
          <Button
            className={styles.edit}
            variant="outline"
            onClick={() => setIsLinking(true)}
          >
            <LuPencil aria-hidden="true" />
            &nbsp;{portrait ? "TROCAR IMAGEM" : "PÔR UMA IMAGEM"}
          </Button>
        ) : null}
      </section>

      {/* A chave devolve o campo ao endereço atual a cada abertura: sem ela,
          cancelar e reabrir traria o texto que a pessoa acabou de descartar. */}
      {isLinking ? (
        <PortraitLinkModal
          key={avatarUrl ?? ""}
          isOpen
          avatarUrl={avatarUrl}
          onConfirm={(next) => {
            onChange?.(next)
            setIsLinking(false)
          }}
          onClose={() => setIsLinking(false)}
        />
      ) : null}
    </WideDrawer>
  )
}
