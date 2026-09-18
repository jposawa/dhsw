import { Avatar } from "@jposawa/ronin-ui"
import { useAtom, useAtomValue } from "jotai"
import React from "react"
import { Link } from "react-router-dom"

import { NavIcon, Switch } from "@/components"
import { ROUTES } from "@/constants"
import { useAuth } from "@/hooks"
import { charactersAtom, syncStatusAtom, themeAtom } from "@/states"

import styles from "./UserMenu.module.css"

const SYNC_LABELS: Record<string, string> = {
  idle: "não sincronizado",
  pulling: "sincronizando…",
  ready: "em dia",
  error: "falhou",
}

/**
 * Perfil: gatilho na barra inferior, painel com prévia e ações rápidas.
 *
 * O gatilho se chama PERFIL e não CONTA porque é para o perfil que ele leva —
 * e porque o rótulo visível e o nome acessível têm que ser o mesmo, senão quem
 * dita "perfil" por voz não acha o botão que lê "conta".
 *
 * Deslogado, o painel também abre: traz o botão de entrar e o tema, que não
 * depende de conta. O `signIn` sai direto do clique no item — `signInWithPopup`
 * precisa de gesto do usuário, senão o navegador bloqueia o pop-up
 * (`services/authService.ts`).
 */
export const UserMenu = ({ isNavCollapsed = false }: { isNavCollapsed?: boolean }) => {
  const { status, user, signIn, signOut } = useAuth()
  const [theme, setTheme] = useAtom(themeAtom)
  const syncStatus = useAtomValue(syncStatusAtom)
  const characters = useAtomValue(charactersAtom)

  const [isOpen, setIsOpen] = React.useState(false)
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  const close = React.useCallback(() => {
    setIsOpen(false)
  }, [])

  React.useEffect(() => {
    if (!isOpen) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        close()
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close()
        // Devolve o foco ao gatilho: fechar com Escape e perder o foco no
        // corpo do documento deixa quem usa teclado sem lugar.
        triggerRef.current?.focus()
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, close])

  if (status === "unknown") {
    return (
      <div className={styles.wrapper} data-collapsed={isNavCollapsed}>
        <span className={[styles.trigger, styles.placeholder].join(" ")}>
          <i className={[styles.triggerSlot, styles.triggerIcon].join(" ")} aria-hidden="true">
            <NavIcon name="account" />
          </i>
          <span className={styles.triggerLabel}>PERFIL</span>
        </span>
      </div>
    )
  }

  const signedUser = status === "signed-out" ? null : user
  const isDark = theme === "dark"
  const triggerName = signedUser ? signedUser.displayName : "Entrar"
  // Deslogado, entrar é a única ação que destrava ficha e grupo — ela não pode
  // pesar o mesmo que um destino qualquer do trilho.
  const isGuest = signedUser === null

  return (
    <div className={styles.wrapper} ref={wrapperRef} data-collapsed={isNavCollapsed}>
      <button
        type="button"
        ref={triggerRef}
        className={styles.trigger}
        data-guest={isGuest || undefined}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={signedUser ? `Perfil de ${signedUser.displayName}` : "Entrar"}
        title={isNavCollapsed ? triggerName : undefined}
        onClick={() => setIsOpen((open) => !open)}
      >
        {signedUser ? (
          <span className={styles.triggerSlot}>
            <Avatar
              className={styles.triggerAvatar}
              imageUrl={signedUser.photoUrl ?? undefined}
              name={signedUser.displayName}
              size="sm"
            />
          </span>
        ) : (
          <i className={[styles.triggerSlot, styles.triggerIcon].join(" ")} aria-hidden="true">
            <NavIcon name="account" />
          </i>
        )}
        <span className={styles.triggerLabel}>{signedUser ? "PERFIL" : "ENTRAR"}</span>
      </button>

      {isOpen ? (
        <section className={styles.panel} aria-label={signedUser ? "Perfil" : "Entrar"}>
          {signedUser ? (
            <>
              <header className={styles.identity}>
                <Avatar
                  imageUrl={signedUser.photoUrl ?? undefined}
                  name={signedUser.displayName}
                  size="md"
                />
                <span className={styles.identityText}>
                  <strong className={styles.identityName}>{signedUser.displayName}</strong>
                  <span className={styles.identityEmail}>{signedUser.email}</span>
                </span>
              </header>

              <div className={styles.preview}>
                <span className={styles.previewRow}>
                  Fichas
                  <b className={styles.previewValue}>{characters.length}</b>
                </span>
                <span className={styles.previewRow}>
                  Sincronização
                  <b
                    className={[
                      styles.previewValue,
                      syncStatus === "error" ? styles.previewValueWarn : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {SYNC_LABELS[syncStatus] ?? syncStatus}
                  </b>
                </span>
              </div>
            </>
          ) : (
            <p className={styles.guestNote}>Sem conta, o compêndio fica aberto. Fichas pedem login.</p>
          )}

          <menu className={styles.menu}>
            <li>
              {signedUser ? (
                /* Fecha no clique, nao num efeito de rota: a unica navegacao
                   de dentro do painel e esta, e clicar em qualquer outra coisa
                   ja cai no handler de clique-fora. */
                <Link className={styles.item} to={ROUTES.profile} onClick={close}>
                  <span>
                    <i className={styles.itemIcon} aria-hidden="true">
                      ◇{" "}
                    </i>
                    Perfil
                  </span>
                </Link>
              ) : (
                <button
                  type="button"
                  className={styles.item}
                  onClick={() => {
                    close()
                    void signIn()
                  }}
                >
                  <span>
                    <i className={styles.itemIcon} aria-hidden="true">
                      →{" "}
                    </i>
                    Entrar com Google
                  </span>
                </button>
              )}
            </li>

            <li>
              <Switch
                className={styles.item}
                isOn={isDark}
                onToggle={() => setTheme(isDark ? "light" : "dark")}
              >
                <i className={styles.itemIcon} aria-hidden="true">
                  {isDark ? "◐" : "◑"}
                </i>
                Tema escuro
              </Switch>
            </li>

            {signedUser ? (
              <li>
                <button
                  type="button"
                  className={[styles.item, styles.signOut].join(" ")}
                  onClick={() => void signOut()}
                >
                  <span>
                    <i className={styles.itemIcon} aria-hidden="true">
                      ✕{" "}
                    </i>
                    Sair da conta
                  </span>
                </button>
              </li>
            ) : null}
          </menu>
        </section>
      ) : null}
    </div>
  )
}
