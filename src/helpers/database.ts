/**
 * `undefined` explode no Realtime Database e `null` apaga o nó. Todo objeto
 * que sai do app para o banco passa por aqui: chave indefinida é omitida, não
 * enviada.
 */
export const sanitize = <TValue>(value: TValue): TValue => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item)) as TValue
  }

  if (value === null || typeof value !== "object") {
    return value
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, fieldValue]) => fieldValue !== undefined)
    .map(([key, fieldValue]) => [key, sanitize(fieldValue)])

  return Object.fromEntries(entries) as TValue
}
