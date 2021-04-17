import create from 'zustand'
import produce from 'immer'
import { NETWORK } from 'store/networks'

export type TokenListEntry = {
  name: string
  symbol: string
  decimals: number
  address: string
  logoURL: string
}

type State = {
  tokens: TokenListEntry[]
}

export const useTokenListStore = create<State>((set) => ({
  tokens: [],
}))

function setNestedState(fn) {
  useTokenListStore.setState(produce(useTokenListStore.getState(), fn))
}

export async function initTokenList() {
  const jsonTokens = NETWORK.getTokenList()
  let tokens: TokenListEntry[] = jsonTokens.map(
    (token) =>
      <TokenListEntry>{
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        address: token.address,
        logoURL: token.logoURI,
      }
  )

  // Remove duplicates
  const filtered = tokens.filter(
    (token, index, self) =>
      index === self.findIndex((t) => t.address === token.address)
  )

  setNestedState((s: State) => {
    s.tokens = filtered
  })
}
