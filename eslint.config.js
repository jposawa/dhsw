import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      // Aspas duplas em toda string. `avoidEscape` deixa a string que contém
      // uma aspa usar apóstrofo, porque `"ele disse \"oi\""` é pior de ler que
      // a alternativa — a regra existe para uniformizar, não para poluir.
      '@stylistic/quotes': ['error', 'double', { avoidEscape: true }],
      '@stylistic/jsx-quotes': ['error', 'prefer-double'],
    },
  },
])
