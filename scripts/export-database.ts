/**
 * Gera o que vai para os nós públicos do Realtime Database, um arquivo por nó:
 *
 *   database-export/compendium.json  → /dhsw/<env>/compendium
 *   database-export/config.json      → /dhsw/<env>/config
 *
 * Um arquivo por nó porque o "Importar JSON" do console **substitui o nó
 * aberto inteiro**: importar os dois juntos em /dhsw/<env> apagaria fichas,
 * grupos e acessos. Cada arquivo se importa com o próprio nó aberto.
 *
 * O compêndio sai dos JSON de data/compendium/ — fora do git; só existe na
 * máquina de quem edita o compêndio. A config sai do padrão do
 * código (`DEFAULT_CONFIG`), com o menu completo — todo item do catálogo com
 * `active` e `order` —, para ser editável pelo console. Com o nó no banco, o
 * banco manda; o código só cobre o que faltar.
 *
 * Não escreve no banco.
 *
 * Roda com: pnpm export:database [pasta de saída]
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { basename, join } from "node:path"

import { createServer } from "vite"

const ROOT = process.cwd()
const DATA_DIR = join(ROOT, "data", "compendium")
const outputDir = process.argv[2] ?? join(ROOT, "database-export")

type NavItem = { key: string; active: boolean; order: number }

const writeJson = (fileName: string, value: unknown) => {
  const path = join(outputDir, fileName)

  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8")

  return path
}

const compendium = Object.fromEntries(
  readdirSync(DATA_DIR)
    .filter((fileName) => fileName.endsWith(".json"))
    .map((fileName) => [
      basename(fileName, ".json"),
      JSON.parse(readFileSync(join(DATA_DIR, fileName), "utf8")) as unknown,
    ]),
)

// As constantes do app importam por `@/`; o Vite resolve o alias do projeto.
const vite = await createServer({
  root: ROOT,
  logLevel: "error",
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
})

try {
  const { DEFAULT_CONFIG, NAV_ITEMS } = (await vite.ssrLoadModule("/src/constants/index.ts")) as {
    DEFAULT_CONFIG: Record<string, unknown>
    NAV_ITEMS: readonly NavItem[]
  }

  // `announcement: null` fica de fora: o banco apaga null de qualquer jeito, e
  // a leitura devolve o padrão para o que faltar.
  const { announcement, ...config } = DEFAULT_CONFIG
  const menuItems = Object.fromEntries(
    NAV_ITEMS.map((item) => [item.key, { active: item.active, order: item.order }]),
  )

  mkdirSync(outputDir, { recursive: true })

  const compendiumPath = writeJson("compendium.json", compendium)
  const configPath = writeJson("config.json", {
    ...config,
    ...(announcement === null ? {} : { announcement }),
    menuItems,
  })

  console.log(`${Object.keys(compendium).length} coleções em ${compendiumPath}`)
  console.log(`config em ${configPath}`)
} finally {
  await vite.close()
}
