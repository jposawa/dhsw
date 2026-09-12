/**
 * Confere que todo `styles.algo` tem uma classe correspondente no `.module.css`
 * ao lado.
 *
 * Existe porque CSS module **não falha**: `styles.rowActions` sem a classe
 * definida devolve `undefined`, React renderiza `class="undefined"` e a tela
 * sai torta sem que `tsc`, `eslint` ou o build digam nada. Num projeto em que
 * o agente não roda o app (`specs/STANDARDS.md`, Agent execution limits), esse
 * erro só aparece quando alguém abre a página — e já aconteceu duas vezes.
 *
 * Só acusa o caminho que quebra a tela: classe usada e não definida. Classe
 * definida e não usada é ruído aqui, porque `Reference.module.css` é
 * compartilhado por cinco telas de propósito e cada uma usa uma fatia.
 *
 * Roda com: pnpm check:styles
 */
import { readFileSync, readdirSync } from "node:fs"
import { dirname, join } from "node:path"

const SOURCE_DIR = join(process.cwd(), "src")

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)

    return entry.isDirectory() ? walk(full) : [full]
  })

type Problem = {
  file: string
  missing: string[]
}

const findProblems = (): Problem[] => {
  const problems: Problem[] = []

  for (const file of walk(SOURCE_DIR).filter((name) => name.endsWith(".tsx"))) {
    const source = readFileSync(file, "utf8")
    const styleImport = source.match(/import styles from "\.\/([\w.-]+\.module\.css)"/)

    if (!styleImport) {
      continue
    }

    const css = readFileSync(join(dirname(file), styleImport[1]), "utf8")
    const defined = new Set(
      [...css.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((match) => match[1]),
    )
    const used = new Set(
      [...source.matchAll(/styles\.([a-zA-Z][\w]*)/g)].map((match) => match[1]),
    )

    const missing = [...used].filter((name) => !defined.has(name))

    if (missing.length > 0) {
      problems.push({ file, missing })
    }
  }

  return problems
}

const problems = findProblems()

for (const problem of problems) {
  console.error(`${problem.file}: classe sem definição — ${problem.missing.join(", ")}`)
}

if (problems.length > 0) {
  console.error(`\n${problems.length} arquivo(s) com classe de CSS module ausente.`)
  process.exit(1)
}

console.log("check:styles — toda classe referenciada existe.")
