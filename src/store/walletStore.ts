import create from 'zustand'
import Web3 from 'web3'

import { initContractsFromWeb3, clearContracts } from './contractStore'

type State = {
  web3: Web3
  address: string
  chainID: number
}

export const useWalletStore = create<State>((set) => ({
  web3: undefined,
  address: '',
  chainID: -1,
}))

async function handleWeb3Change() {
  const web3 = useWalletStore.getState().web3 as any

  if (!web3) return

  if (web3.currentProvider.off !== undefined) {
    web3.currentProvider.off('chainChanged', handleWeb3Change)
    web3.currentProvider.off('accountsChanged', handleWeb3Change)
  }

  await setWeb3(web3, localStorage.getItem('WALLET_TYPE'))
}

export async function setWeb3(web3, wallet) {
  const address = (await web3.eth.getAccounts())[0]
  web3.eth.defaultAccount = address

  if (web3.currentProvider.on !== undefined) {
    web3.currentProvider.on('chainChanged', handleWeb3Change)
    web3.currentProvider.on('accountsChanged', handleWeb3Change)
  }

  // Use ETH node provider from wallet that is free to init contracts
  initContractsFromWeb3(web3)

  const chainID = await web3.eth.getChainId()

  useWalletStore.setState({
    web3: web3,
    address: address,
    chainID: chainID,
  })

  if (wallet) {
    localStorage.setItem('WALLET_TYPE', wallet.toString())
  }
}

export async function unsetWeb3() {
  useWalletStore.setState({
    web3: undefined,
    address: '',
    chainID: -1,
  })

  localStorage.removeItem('WALLET_TYPE')

  clearContracts()
}
