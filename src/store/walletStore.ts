import create from 'zustand'
import Web3 from 'web3'

import { initContractsFromWeb3, clearContracts } from './contractStore'

import ENS, { getEnsAddress } from '@ensdomains/ensjs'
import { NETWORK } from 'store/networks'
import { checkForNewAddresses } from 'lib/utils/address'
import { useSessionStore } from './useSessionStore'

type State = {
  web3: Web3
  address: string
  chainID: number
  ens: ENS
}

export const useWalletStore = create<State>((set) => ({
  web3: undefined,
  address: '',
  chainID: -1,
  ens: undefined,
}))

async function handleWeb3Change() {
  const web3 = useWalletStore.getState().web3 as any
  const session = useSessionStore.getState().session as any
  const refetchSession = useSessionStore.getState().refetchSession as any

  if (!web3) return

  if (web3.currentProvider.off !== undefined) {
    web3.currentProvider.off('chainChanged', handleWeb3Change)
    web3.currentProvider.off('accountsChanged', handleWeb3Change)
  }

  await setWeb3(
    web3,
    localStorage.getItem('WALLET_TYPE'),
    session,
    refetchSession
  )
}

export async function setWeb3(web3, wallet, session, refetchSession) {
  const address = (await web3.eth.getAccounts())[0]
  web3.eth.defaultAccount = address

  if (web3.currentProvider.on !== undefined) {
    web3.currentProvider.on('chainChanged', handleWeb3Change)
    web3.currentProvider.on('accountsChanged', handleWeb3Change)
  }

  initContractsFromWeb3(web3)

  const chainID = await web3.eth.getChainId()
  const ens = new ENS({
    provider: web3.currentProvider,
    ensAddress: getEnsAddress(NETWORK.getChainID().toString()),
  })

  useWalletStore.setState({
    web3: web3,
    address: address,
    chainID: chainID,
    ens,
  })
  useSessionStore.setState({
    session,
    refetchSession,
  })

  checkForNewAddresses(address, session, refetchSession)

  if (wallet) {
    localStorage.setItem('WALLET_TYPE', wallet.toString())
  }
}

export async function unsetWeb3() {
  useWalletStore.setState({
    web3: undefined,
    address: '',
    chainID: -1,
    ens: undefined,
  })

  localStorage.removeItem('WALLET_TYPE')

  clearContracts()
}
