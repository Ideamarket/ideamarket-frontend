import create from 'zustand'
import Web3 from 'web3'

import { initContractsFromWeb3, clearContracts } from './contractStore'
import { NETWORK } from 'utils'

type State = {
  web3: Web3
  address: string
  network: string
}

export const useWalletStore = create<State>((set) => ({
  web3: undefined,
  address: '',
  network: '',
}))

export const initWalletStore = async () => {
  const wallets = require('eth-wallets')
  await wallets.setOption(
    wallets.WALLETS.WALLETCONNECT,
    wallets.OPTIONS.INFURA_KEY,
    '3399077c10a24059be2a6c5b4fa77c03'
  )
  await wallets.setOption(
    wallets.WALLETS.COINBASE,
    wallets.OPTIONS.JSON_RPC_URL,
    'https://mainnet.infura.io/v3/3399077c10a24059be2a6c5b4fa77c03'
  )

  if (NETWORK === 'mainnet') {
    await wallets.setOption(
      wallets.WALLETS.FORTMATIC,
      wallets.OPTIONS.API_KEY,
      'pk_live_B3A1A25FBF96DCB5'
    )
  } else {
    await wallets.setOption(
      wallets.WALLETS.FORTMATIC,
      wallets.OPTIONS.API_KEY,
      'pk_test_4F838B34CAE38BC8'
    )

    await wallets.setOption(
      wallets.WALLETS.FORTMATIC,
      wallets.OPTIONS.CHAIN,
      wallets.CHAINS.RINKEBY
    )
  }

  const walletStr = localStorage.getItem('WALLET_TYPE')
  try {
    if (walletStr !== null) {
      const wallet = parseInt(walletStr)

      if (
        (await wallets.isAvailable(wallet)) &&
        (await wallets.isConnected(wallet))
      ) {
        const web3 = await wallets.connect(wallet)
        await setWeb3(web3, wallet)
      }
    }
  } catch (ex) {
    console.log(ex)
    localStorage.removeItem('WALLET_TYPE')
  }
}

async function handleWeb3Change() {
  const web3 = useWalletStore.getState().web3 as any
  web3.currentProvider.off('networkChanged', handleWeb3Change)
  web3.currentProvider.off('accountsChanged', handleWeb3Change)

  await setWeb3(web3, localStorage.getItem('WALLET_TYPE'))
}

export async function setWeb3(web3, wallet) {
  const address = (await web3.eth.getAccounts())[0]
  web3.eth.defaultAccount = address

  if (web3.currentProvider.on !== undefined) {
    web3.currentProvider.on('networkChanged', handleWeb3Change)
    web3.currentProvider.on('accountsChanged', handleWeb3Change)
  }

  initContractsFromWeb3(web3)

  const web3Network = await web3.eth.net.getNetworkType()
  useWalletStore.setState({
    web3: web3,
    address: address,
    network: web3Network,
  })

  localStorage.setItem('WALLET_TYPE', wallet.toString())
}

export async function unsetWeb3() {
  useWalletStore.setState({
    web3: undefined,
    address: '',
  })

  localStorage.removeItem('WALLET_TYPE')

  clearContracts()
}
