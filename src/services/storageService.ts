import type { SyncStorage } from 'jotai/vanilla/utils/atomWithStorage'

import type { VersionedStorageOptions } from '@/types'

/**
 * Armazenamento local versionado.
 *
 * Migração é obrigatória desde o primeiro dia — o formato vai mudar, e sem
 * `version` + `migrate` uma atualização quebra a ficha de alguém no meio de
 * uma sessão. A migração roda na LEITURA, nunca na escrita, e as funções são
 * acumulativas: nenhuma delas é apagada quando a próxima entra.
 */

type VersionedPayload<TValue> = {
  version: number
  value: TValue
}

const isVersionedPayload = (raw: unknown): raw is VersionedPayload<unknown> =>
  typeof raw === 'object' &&
  raw !== null &&
  'version' in raw &&
  typeof (raw as { version: unknown }).version === 'number' &&
  'value' in raw

export const createVersionedStorage = <TValue>(
  { version, migrations }: VersionedStorageOptions<TValue>,
): SyncStorage<TValue> => ({
  getItem: (key, initialValue) => {
    let raw: string | null

    try {
      raw = localStorage.getItem(key)
    } catch {
      // Modo privado, cookies bloqueados, iframe sem permissão: o app tem
      // que abrir do mesmo jeito. É local-first, não local-obrigatório.
      return initialValue
    }

    if (!raw) {
      return initialValue
    }

    try {
      const parsed: unknown = JSON.parse(raw)

      if (!isVersionedPayload(parsed)) {
        return initialValue
      }

      let migrated: unknown = parsed.value

      for (let from = parsed.version; from < version; from += 1) {
        const migrate = migrations[from]

        if (!migrate) {
          return initialValue
        }

        migrated = migrate(migrated)
      }

      return migrated as TValue
    } catch {
      return initialValue
    }
  },

  setItem: (key, value) => {
    try {
      const payload: VersionedPayload<TValue> = { version, value }
      localStorage.setItem(key, JSON.stringify(payload))
    } catch {
      // Cota estourada ou storage indisponível. Perder a gravação é ruim;
      // derrubar a sessão de jogo por causa dela é pior.
    }
  },

  removeItem: (key) => {
    try {
      localStorage.removeItem(key)
    } catch {
      // idem
    }
  },
})
