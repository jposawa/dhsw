import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getDatabase, ref, type DatabaseReference } from 'firebase/database'

import { DATABASE_ENVIRONMENTS, DATABASE_ROOT } from '@/constants'
import type { DatabaseEnvironment } from '@/types'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const EXPECTED_PROJECT_ID = 'jpdh-88a6c'

const resolveEnvironment = (): DatabaseEnvironment => {
  const configured = import.meta.env.VITE_DATABASE_TARGET_ENV

  if (configured === DATABASE_ENVIRONMENTS.Prod) {
    return DATABASE_ENVIRONMENTS.Prod
  }

  if (configured !== DATABASE_ENVIRONMENTS.Stage && import.meta.env.DEV) {
    console.warn(
      `VITE_DATABASE_TARGET_ENV="${configured}" não reconhecido. Usando "stage".`,
    )
  }

  return DATABASE_ENVIRONMENTS.Stage
}

export const databaseEnvironment = resolveEnvironment()

/** `dhsw/stage` ou `dhsw/prod`. Nenhum caminho do app escapa daqui. */
const DATABASE_PREFIX = `${DATABASE_ROOT}/${databaseEnvironment}`

export const firebaseApp: FirebaseApp = initializeApp(firebaseConfig)
export const firebaseAuth: Auth = getAuth(firebaseApp)

/**
 * NÃO exportado, e é isso que dá a garantia.
 *
 * Sem a instância crua não existe caminho no app capaz de sair de
 * `/dhsw/<env>` — nem por descuido, nem por copiar e colar exemplo da
 * documentação do Firebase, que sempre usa `ref(db, 'users/' + uid)`.
 *
 * O projeto `jpdh-88a6c` não é dedicado ao DH-SW: pode hospedar outro app na
 * mesma árvore. A raiz nomeada é o que separa. Ver BACKEND.md.
 */
const database = getDatabase(firebaseApp)

if (import.meta.env.DEV && firebaseConfig.projectId !== EXPECTED_PROJECT_ID) {
  console.warn(
    [
      `Firebase apontando para "${firebaseConfig.projectId}", esperado "${EXPECTED_PROJECT_ID}".`,
      'Um .env copiado do ficha-pet aponta para outra instância. Ver CONFIG.md.',
    ].join(' '),
  )
}

/** Única forma de obter uma ref. Sempre ancorada em /dhsw/<env>. */
export const dhswRef = (path: string): DatabaseReference => {
  if (path.startsWith('/')) {
    throw new Error(
      `Caminho deve ser relativo à raiz ${DATABASE_PREFIX}, recebido "${path}"`,
    )
  }

  return ref(database, `${DATABASE_PREFIX}/${path}`)
}

/**
 * Caminho absoluto, para `update()` multi-caminho — a única operação do RTDB
 * que exige o caminho completo em vez de uma ref. Escrever ficha e índice de
 * acesso numa transação só depende disto.
 */
export const dhswPath = (path: string): string => `${DATABASE_PREFIX}/${path}`

/** Raiz do ramo ativo, para o `update()` multi-caminho. */
export const dhswRootRef = (): DatabaseReference => ref(database)
