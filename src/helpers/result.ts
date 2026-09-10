import type { Result, RuleErrorCode } from "@/types"

/** Construtores de `Result`. Funcoes puras — `types/` guarda so o formato. */

export const ok = <TValue>(value: TValue): Result<TValue> => ({ ok: true, value })

export const fail = (code: RuleErrorCode, detail?: string): Result<never> => ({
  ok: false,
  code,
  detail,
})
