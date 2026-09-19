/**
 * Endereço de imagem que a pessoa digitou.
 *
 * A ficha e o perfil guardam **o endereço**, não o arquivo: não há upload aqui,
 * e a imagem é carregada de onde ela já está. Quem hospeda é quem colou o link.
 */

/** Só `http` e `https` viram imagem. */
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"])

/**
 * Texto → endereço de imagem, ou `null`.
 *
 * Recusa o que não é URL e o que é URL de outro protocolo. `javascript:` não
 * executa em `src` de `<img>` em navegador de hoje, mas `data:` e `blob:`
 * guardariam o arquivo inteiro dentro da ficha — que sobe para o banco a cada
 * gravação e viaja no código de compartilhamento.
 */
export const toImageUrl = (text: string): string | null => {
  const trimmed = text.trim()

  if (!trimmed) {
    return null
  }

  try {
    const url = new URL(trimmed)

    return ALLOWED_PROTOCOLS.has(url.protocol) ? url.toString() : null
  } catch {
    return null
  }
}

/** O texto digitado já é um endereço utilizável? Para acender o botão de salvar. */
export const isImageUrl = (text: string): boolean => toImageUrl(text) !== null
