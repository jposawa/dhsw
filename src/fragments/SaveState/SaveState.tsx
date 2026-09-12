import { useAtomValue } from "jotai"

import { authAtom, syncStatusAtom, unsyncedSheetIdsAtom } from "@/states"
import type { BaseComponent } from "@/types"

import styles from "./SaveState.module.css"

type SaveStateProps = BaseComponent & {
  sheetId: string
}

/**
 * Se esta ficha já está salva.
 *
 * **Não existe botão de salvar, e isso é decisão de produto.** Marcar Stress no
 * meio de um turno e depois ter que confirmar seria um passo a mais em cima do
 * gesto mais frequente do app; a gravação é local e imediata, e o servidor
 * recebe logo atrás, com atraso. `dh-sw-arquitetura.md` §5.
 *
 * O que faltava não era o botão — era o retorno. Sem ele a escrita é
 * invisível, e "será que salvou?" vira motivo para não fechar o app. Esta
 * linha responde isso, e é o que um botão de salvar responderia.
 */
export const SaveState = ({ sheetId, className, style }: SaveStateProps) => {
  const { status } = useAtomValue(authAtom)
  const syncStatus = useAtomValue(syncStatusAtom)
  const unsyncedSheetIds = useAtomValue(unsyncedSheetIdsAtom)

  const isPending = unsyncedSheetIds.has(sheetId)

  // Sem conta não há para onde sincronizar, e prometer "salvo" sem dizer onde
  // seria a meia-verdade que faz alguém perder a ficha ao trocar de aparelho.
  if (status !== "signed-in") {
    return (
      <p className={className} style={style} data-testid="sheet-save-state">
        <span className={styles.local}>Salvo neste aparelho.</span> Entre com uma conta
        para sincronizar.
      </p>
    )
  }

  // Erro antes de pendência: uma escrita que falhou devolve a ficha para a
  // fila, e anunciar "salvando…" para sempre esconderia justamente a falha.
  if (syncStatus === "error") {
    return (
      <p className={className} style={style} data-testid="sheet-save-state">
        <span className={styles.failed}>Não salvou no servidor.</span> A ficha está
        inteira neste aparelho; o detalhe está no Perfil.
      </p>
    )
  }

  return (
    <p className={className} style={style} data-testid="sheet-save-state">
      {isPending ? (
        <span className={styles.pending}>Salvando…</span>
      ) : (
        <span className={styles.saved}>Salvo</span>
      )}
    </p>
  )
}
