import { Tabs } from "@jposawa/ronin-ui"
import { useSearchParams } from "react-router-dom"

import { StepRule } from "@/components"

import { ProfileAccount } from "./ProfileAccount"
import { ProfileRules } from "./ProfileRules"

import styles from "./Profile.module.css"

const PROFILE_TAB_IDS = ["conta", "regras"] as const

type ProfileTabId = (typeof PROFILE_TAB_IDS)[number]

const isProfileTab = (value: string | null): value is ProfileTabId =>
  PROFILE_TAB_IDS.some((id) => id === value)

/**
 * Perfil. Alcançado pelo menu da conta, não pela barra inferior — por isso
 * fica fora do catálogo de `appNav.ts`.
 *
 * A aba vive na URL (`?aba=regras`): é o que deixa o antigo `/regras` cair
 * direto nela, e um link para o modelo de regras funcionar.
 */
export const Profile = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const requested = searchParams.get("aba")
  const tab: ProfileTabId = isProfileTab(requested) ? requested : "conta"

  return (
    <main className={styles.page}>
      <StepRule />

      <Tabs
        hideArrows
        hideDots
        activeTabId={tab}
        onTabChange={(tabId) => setSearchParams({ aba: tabId }, { replace: true })}
        tabs={[
          { id: "conta", label: "Conta", content: <ProfileAccount /> },
          { id: "regras", label: "Regras da casa", content: <ProfileRules /> },
        ]}
      />
    </main>
  )
}
