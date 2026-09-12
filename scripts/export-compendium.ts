/**
 * Junta os JSON de src/compendium/data/ num arquivo só, no formato do nó
 * `/dhsw/<env>/compendium` do Realtime Database.
 *
 * Não escreve no banco. O arquivo sai para importar pelo console do Firebase
 * ("Importar JSON" em /dhsw/stage/compendium), por quem decidir fazer isso.
 *
 * Roda com: pnpm export:compendium [caminho de saída]
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { basename, join } from "node:path"

const DATA_DIR = join(process.cwd(), "src", "compendium", "data")
const outputPath = process.argv[2] ?? join(process.cwd(), "compendium-export.json")

const collections = Object.fromEntries(
  readdirSync(DATA_DIR)
    .filter((fileName) => fileName.endsWith(".json"))
    .map((fileName) => [
      basename(fileName, ".json"),
      JSON.parse(readFileSync(join(DATA_DIR, fileName), "utf8")) as unknown,
    ]),
)

writeFileSync(outputPath, `${JSON.stringify(collections, null, 2)}\n`, "utf8")

console.log(`${Object.keys(collections).length} coleções em ${outputPath}`)
