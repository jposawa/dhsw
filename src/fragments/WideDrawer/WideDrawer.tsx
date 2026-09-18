import { Drawer } from "@jposawa/ronin-ui"
import clsx from "clsx"
import type React from "react"

import type { BaseComponent } from "@/types"

import styles from "./WideDrawer.module.css"

type WideDrawerProps = BaseComponent & {
  isOpen: boolean
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  onClose: () => void
}

/**
 * A gaveta das listas de escolher: classe, espécie, carta, equipamento.
 *
 * A `Drawer` da ronin-ui abre com 24rem, que é medida de formulário. Aqui
 * dentro vai **conteúdo de leitura e comparação** — o texto inteiro de duas
 * features, a carta com o efeito, uma tabela de arma —, e 24rem obriga a rolar
 * cada bloco num tubo estreito no desktop.
 *
 * A largura mora aqui, num lugar só: cada gaveta que decidisse a sua ia
 * divergir na primeira troca. Abaixo de 900px continua ocupando a tela toda.
 */
export const WideDrawer = ({
  isOpen,
  title,
  children,
  footer,
  onClose,
  className,
  style,
}: WideDrawerProps) => (
  <Drawer
    className={clsx(styles.drawer, className)}
    style={style}
    isOpen={isOpen}
    title={title}
    footer={footer}
    onClose={onClose}
  >
    {children}
  </Drawer>
)
