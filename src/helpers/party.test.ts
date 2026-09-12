import { describe, expect, it } from "vitest"

import type { Party, PartyMember, PartyRoleId } from "@/types"

import {
  canLeaveParty,
  canRemoveSheetFromParty,
  isPartyNarrator,
  isPartyOwner,
  mustHandOverParty,
  promotableMembers,
  successorCandidates,
} from "./party"

const member = (userId: string, roleId: PartyRoleId): PartyMember => ({
  partyId: "p1",
  userId,
  roleId,
  level: roleId === "gm" ? 20 : 10,
  joinedAt: 100,
})

const partyOf = (createdBy: string): Party => ({
  id: "p1",
  name: "A mesa de quinta",
  createdBy,
  createdAt: 1,
  updatedAt: 1,
  notes: "",
})

describe("canLeaveParty", () => {
  it("deixa o jogador sair, porque a mesa continua com Narrador", () => {
    const members = [member("gm", "gm"), member("eu", "player")]

    expect(canLeaveParty(members, "eu")).toBe(true)
  })

  it("barra o unico Narrador, que e o que impede o grupo orfao", () => {
    const members = [member("eu", "gm"), member("outro", "player")]

    expect(canLeaveParty(members, "eu")).toBe(false)
  })

  it("barra o Narrador sozinho na mesa", () => {
    expect(canLeaveParty([member("eu", "gm")], "eu")).toBe(false)
  })

  it("libera assim que existe um segundo Narrador — promover destrava a saida", () => {
    const members = [member("eu", "gm"), member("outro", "gm")]

    expect(canLeaveParty(members, "eu")).toBe(true)
  })

  it("nega quem nem esta no grupo", () => {
    expect(canLeaveParty([member("gm", "gm")], "estranho")).toBe(false)
  })

  it("nega na lista vazia, em vez de tratar ausencia como permissao", () => {
    expect(canLeaveParty([], "eu")).toBe(false)
  })
})

describe("isPartyNarrator", () => {
  it("reconhece o Narrador", () => {
    expect(isPartyNarrator([member("eu", "gm")], "eu")).toBe(true)
  })

  it("nao promove o jogador", () => {
    expect(isPartyNarrator([member("eu", "player")], "eu")).toBe(false)
  })
})

describe("isPartyOwner", () => {
  it("o Dono e quem criou, nao quem administra", () => {
    const party = partyOf("dono")

    expect(isPartyOwner(party, "dono")).toBe(true)
    expect(isPartyOwner(party, "outro-narrador")).toBe(false)
  })

  it("grupo ainda nao carregado nao tem dono", () => {
    expect(isPartyOwner(null, "eu")).toBe(false)
  })
})

describe("promotableMembers", () => {
  it("oferece so quem ainda nao e Narrador", () => {
    const members = [member("eu", "gm"), member("a", "player"), member("b", "player")]

    expect(promotableMembers(members).map((m) => m.userId)).toEqual(["a", "b"])
  })

  it("devolve vazio quando todos ja sao Narradores", () => {
    expect(promotableMembers([member("eu", "gm"), member("b", "gm")])).toEqual([])
  })
})

describe("successorCandidates", () => {
  it("entrega a posse so a outro Narrador", () => {
    const members = [member("eu", "gm"), member("cogm", "gm"), member("jogador", "player")]

    expect(successorCandidates(members, "eu").map((m) => m.userId)).toEqual(["cogm"])
  })

  it("nao oferece entregar o grupo a si mesmo", () => {
    expect(successorCandidates([member("eu", "gm")], "eu")).toEqual([])
  })

  it("vazio quando so ha jogadores — promover vem primeiro", () => {
    const members = [member("eu", "gm"), member("jogador", "player")]

    expect(successorCandidates(members, "eu")).toEqual([])
  })
})

describe("mustHandOverParty", () => {
  it("o Dono entrega antes de sair quando sobra alguem", () => {
    const members = [member("dono", "gm"), member("outro", "gm")]

    expect(mustHandOverParty(partyOf("dono"), members, "dono")).toBe(true)
  })

  it("Dono sozinho nao entrega a ninguem — resta apagar", () => {
    expect(mustHandOverParty(partyOf("dono"), [member("dono", "gm")], "dono")).toBe(false)
  })

  it("quem nao e Dono sai sem entregar nada", () => {
    const members = [member("dono", "gm"), member("eu", "gm")]

    expect(mustHandOverParty(partyOf("dono"), members, "eu")).toBe(false)
  })
})

describe("canRemoveSheetFromParty", () => {
  const members = [member("gm", "gm"), member("eu", "player"), member("outro", "player")]

  it("o autor tira a propria ficha", () => {
    expect(canRemoveSheetFromParty("author", members, "eu")).toBe(true)
  })

  it("o co-autor tambem, porque escreve na ficha", () => {
    expect(canRemoveSheetFromParty("coAuthor", members, "eu")).toBe(true)
  })

  it("o leitor nao tira — ele nem escreve na ficha", () => {
    expect(canRemoveSheetFromParty("reader", members, "eu")).toBe(false)
  })

  it("o Narrador tira qualquer ficha da mesa, inclusive a que nao alcanca", () => {
    expect(canRemoveSheetFromParty(undefined, members, "gm")).toBe(true)
  })

  it("jogador sem acesso a ficha nao tira a de outro", () => {
    expect(canRemoveSheetFromParty(undefined, members, "outro")).toBe(false)
  })
})
