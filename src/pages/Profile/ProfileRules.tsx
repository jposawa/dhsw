import { Button } from "@jposawa/ronin-ui"
import { useAtom } from "jotai"

import { DEFAULT_HOUSE_RULES } from "@/constants"
import { HouseRulesForm } from "@/fragments"
import { houseRulesAtom } from "@/states"

import styles from "./Profile.module.css"

/**
 * O modelo de regras da casa: o que **ficha nova** recebe ao ser criada.
 *
 * Não mexe em ficha nenhuma que já existe — cada uma tem as suas, editadas em
 * Editar ficha, e em mesa valem as da mesa. Grava na hora, como o tema: é
 * preferência deste aparelho, não dado de jogo.
 */
export const ProfileRules = () => {
  const [houseRules, setHouseRules] = useAtom(houseRulesAtom)

  return (
    <section className={styles.panel} aria-label="Modelo de regras da casa">
      <p className={styles.note}>
        <b>Modelo para fichas novas.</b> Cada ficha guarda as próprias regras, e as que já
        existem não mudam por aqui. Numa mesa, valem as regras que o Narrador definiu para
        ela.
      </p>

      <HouseRulesForm value={houseRules} onChange={setHouseRules} />

      <Button variant="outline" onClick={() => setHouseRules(DEFAULT_HOUSE_RULES)}>
        VOLTAR AO PADRÃO DO LIVRO
      </Button>
    </section>
  )
}
