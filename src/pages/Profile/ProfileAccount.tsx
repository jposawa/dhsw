import { Avatar, Button, Input, SectionLabel } from "@jposawa/ronin-ui"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import React from "react"

import { Switch } from "@/components"
import { databaseEnvironment } from "@/lib/firebase"
import { toImageUrl } from "@/helpers"
import { updateAvatarUrl, updateDisplayName } from "@/services"
import {
  charactersAtom,
  profileAtom,
  syncErrorAtom,
  syncStatusAtom,
  themeAtom,
  toastAtom,
} from "@/states"
import { useAuth } from "@/hooks"

import styles from "./Profile.module.css"

const SYNC_LABELS: Record<string, string> = {
  idle: "não sincronizado",
  pulling: "sincronizando…",
  ready: "em dia",
  error: "falhou",
}

/**
 * A aba de conta do perfil: nome na mesa, estado da conta, tema e saída.
 *
 * O que dá para mudar aqui é pouco de propósito: `email` e foto são espelho do
 * Google e não são editáveis, senão deixariam de ser espelho. O nome é o que
 * a mesa vê quando uma ficha for compartilhada, e por isso é seu.
 */
export const ProfileAccount = () => {
  const { user, signOut } = useAuth()
  const [theme, setTheme] = useAtom(themeAtom)
  const syncStatus = useAtomValue(syncStatusAtom)
  const syncError = useAtomValue(syncErrorAtom)
  const characters = useAtomValue(charactersAtom)
  const [profile, setProfile] = useAtom(profileAtom)
  const setToast = useSetAtom(toastAtom)

  /**
   * O que está sendo digitado, ou `null` para "o que está salvo".
   *
   * Assim os campos seguem o perfil enquanto ninguém os toca — inclusive
   * quando ele termina de carregar — sem um efeito copiando um estado para o
   * outro. Salvar devolve ao `null`, e o campo volta a espelhar o banco.
   */
  const [nameDraft, setNameDraft] = React.useState<string | null>(null)
  const [avatarDraft, setAvatarDraft] = React.useState<string | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isSavingAvatar, setIsSavingAvatar] = React.useState(false)

  if (!user) {
    return null
  }

  const savedName = profile?.displayName ?? user.displayName
  const savedAvatar = profile?.avatarUrl ?? null

  const displayName = nameDraft ?? savedName
  const avatarUrl = avatarDraft ?? savedAvatar ?? ""

  const trimmedName = displayName.trim()
  const canSave = trimmedName.length > 0 && trimmedName !== savedName && !isSaving

  // Campo vazio é "apagar a escolha" e vale salvar; texto que não é endereço
  // não vale, e o botão fica apagado em vez de gravar lixo.
  const nextAvatar = toImageUrl(avatarUrl)
  const isAvatarUsable = avatarUrl.trim() === "" || nextAvatar !== null
  const canSaveAvatar = isAvatarUsable && nextAvatar !== savedAvatar && !isSavingAvatar

  const handleSave = async () => {
    setIsSaving(true)

    try {
      await updateDisplayName(user.userId, trimmedName)
      setProfile(profile ? { ...profile, displayName: trimmedName } : profile)
      setNameDraft(null)
      setToast("Nome salvo")
    } catch {
      setToast("Não foi possível salvar o nome.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAvatar = async () => {
    setIsSavingAvatar(true)

    try {
      await updateAvatarUrl(user.userId, nextAvatar)
      setProfile(profile ? { ...profile, avatarUrl: nextAvatar } : profile)
      setAvatarDraft(null)
      setToast(nextAvatar ? "Imagem salva" : "Imagem removida")
    } catch {
      setToast("Não foi possível salvar a imagem.")
    } finally {
      setIsSavingAvatar(false)
    }
  }

  const isDark = theme === "dark"

  return (
    <section className={styles.panel} aria-label="Conta">
      <div className={styles.identity}>
        {/* A escolhida vem primeiro; sem ela, a do Google. */}
        <Avatar
          imageUrl={savedAvatar ?? user.photoUrl ?? undefined}
          name={savedName || user.displayName}
          size="md"
        />
        <span className={styles.identityText}>
          <strong className={styles.name}>{savedName || user.displayName}</strong>
          <span className={styles.email}>{user.email}</span>
        </span>
      </div>

      <SectionLabel>NOME NA MESA</SectionLabel>
      <div className={styles.form}>
        <Input
          label="COMO VOCÊ APARECE PARA QUEM COMPARTILHA FICHA"
          value={displayName}
          maxLength={60}
          onValueChange={setNameDraft}
        />
        <Button isFullWidth disabled={!canSave} onClick={() => void handleSave()}>
          {isSaving ? "SALVANDO…" : "SALVAR NOME"}
        </Button>
      </div>

      <SectionLabel>IMAGEM</SectionLabel>
      <div className={styles.form}>
        <Input
          label="ENDEREÇO DE UMA IMAGEM"
          value={avatarUrl}
          placeholder="https://…"
          maxLength={500}
          errorMessage={isAvatarUsable ? undefined : "Precisa ser um endereço http ou https."}
          onValueChange={setAvatarDraft}
        />
        <p className={styles.note}>
          Fica no lugar da foto do Google. O app guarda o endereço, não o arquivo — a imagem
          continua onde está, e some daqui se sair de lá. Campo vazio volta para a do Google.
        </p>
        <Button isFullWidth disabled={!canSaveAvatar} onClick={() => void handleSaveAvatar()}>
          {isSavingAvatar ? "SALVANDO…" : "SALVAR IMAGEM"}
        </Button>
      </div>

      <SectionLabel>CONTA</SectionLabel>
      <div className={styles.rows}>
        <div className={styles.row}>
          E-mail
          <span className={styles.rowValue}>{user.email}</span>
        </div>
        <div className={styles.row}>
          Fichas
          <span className={styles.rowValue}>{characters.length}</span>
        </div>
        <div className={styles.row}>
          Sincronização
          <span
            className={[
              styles.rowValue,
              syncStatus === "error" ? styles.rowValueWarn : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {SYNC_LABELS[syncStatus] ?? syncStatus}
          </span>
        </div>
        <div className={styles.row}>
          Ambiente
          <span className={styles.rowValue}>{databaseEnvironment}</span>
        </div>
      </div>

      {syncError ? (
        <p className={styles.diagnostic}>
          <b>Última falha</b>
          <br />
          {syncError}
        </p>
      ) : null}

      <p className={styles.note}>
        E-mail e foto vêm do Google e não são editáveis aqui — deixá-los mudáveis
        faria deles alegação, não espelho da conta.
      </p>

      <SectionLabel>PREFERÊNCIAS</SectionLabel>
      <Switch
        className={styles.switch}
        isOn={isDark}
        onToggle={() => setTheme(isDark ? "light" : "dark")}
      >
        TEMA ESCURO
      </Switch>

      <Button
        isFullWidth
        variant="outline"
        intent="danger"
        className={styles.action}
        onClick={() => void signOut()}
      >
        SAIR DA CONTA
      </Button>

      <p className={styles.note}>
        Sair não apaga as fichas deste aparelho — perder o trabalho de quem só
        queria trocar de conta seria pior. Elas voltam a aparecer no próximo login.
      </p>
    </section>
  )
}
