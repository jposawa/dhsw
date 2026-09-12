import clsx from "clsx"
import { useAtomValue } from "jotai"

import { authAtom, syncStatusAtom, unsyncedSheetIdsAtom } from "@/states"
import type { BaseComponent, SaveStateKind } from "@/types"

import { SAVE_STATE_ART } from "./symbols"

import styles from "./SaveState.module.css"

/** O que cada estado diz. Vira `title` e nome acessível — o ícone não fala. */
const SAVE_STATE_LABELS: Readonly<Record<SaveStateKind, string>> = {
  saved: "Salvo",
  saving: "Salvando…",
  failed: "Não salvou no servidor. A ficha está inteira neste aparelho; o detalhe está no Perfil.",
  local: "Salvo neste aparelho. Entre com uma conta para sincronizar.",
}

type SaveStateProps = BaseComponent & {
  sheetId: string
}

/**
 * Se esta ficha já está salva.
 *
 * **Não existe botão de salvar para o que se marca em mesa, e isso é decisão
 * de produto.** Marcar Stress no meio de um turno não pode pedir confirmação;
 * a gravação é local e imediata, e o servidor recebe logo atrás, com atraso.
 * O que faltava não era o botão — era o retorno.
 *
 * **Ícone, não frase.** Ele fica numa faixa que se passa os olhos mil vezes
 * por sessão e nunca se lê; um símbolo estável ali é reconhecido de relance,
 * e uma frase só ocupa a linha. O texto continua existindo para quem ouve e
 * para quem passa o mouse, que é onde o ícone não chega.
 */
export const SaveState = ({ sheetId, className, style }: SaveStateProps) => {
  const { status } = useAtomValue(authAtom)
  const syncStatus = useAtomValue(syncStatusAtom)
  const unsyncedSheetIds = useAtomValue(unsyncedSheetIdsAtom)

  const kind = ((): SaveStateKind => {
    // Sem conta não há para onde sincronizar, e prometer "salvo" sem dizer
    // onde é a meia-verdade que faz alguém perder a ficha ao trocar de
    // aparelho.
    if (status !== "signed-in") {
      return "local"
    }

    // Erro antes de pendência: uma escrita que falhou devolve a ficha para a
    // fila, e anunciar "salvando…" para sempre esconderia justamente a falha.
    if (syncStatus === "error") {
      return "failed"
    }

    return unsyncedSheetIds.has(sheetId) ? "saving" : "saved"
  })()

  return (
    <p
      className={clsx(styles.state, styles[kind], className)}
      style={style}
      title={SAVE_STATE_LABELS[kind]}
      data-testid="sheet-save-state"
    >
      <svg
        className={styles.icon}
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        role="img"
        aria-label={SAVE_STATE_LABELS[kind]}
      >
        {SAVE_STATE_ART[kind]}
      </svg>
    </p>
  )
}
