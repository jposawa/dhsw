/** Contrato do armazenamento local versionado. Implementacao em `services/`. */

export type StorageMigration<TValue> = (value: unknown) => TValue

export type VersionedStorageOptions<TValue> = {
  version: number
  /** Indice = versao de origem. `migrations[1]` leva da v1 para a v2. */
  migrations: Readonly<Record<number, StorageMigration<TValue>>>
}
