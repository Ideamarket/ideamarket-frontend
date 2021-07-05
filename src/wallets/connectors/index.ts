import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { FortmaticConnector } from '@web3-react/fortmatic-connector'
import { PortisConnector } from '@web3-react/portis-connector'
import { TorusConnector } from '@web3-react/torus-connector'
import { MAINNET, RINKEBY } from 'wallets/chains'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { NETWORK } from 'store/networks'

const POLLING_INTERVAL = 12000
const RPC_URLS: { [chainId: number]: string } = {
  1: 'https://mainnet.infura.io/v3/3399077c10a24059be2a6c5b4fa77c03',
}

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42],
})

export const walletconnect = new WalletConnectConnector({
  rpc: { 1: RPC_URLS[1] },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: POLLING_INTERVAL,
})

export const walletlink = new WalletLinkConnector({
  url: RPC_URLS[1],
  appName: 'Ideamarket',
})

export function resetWalletConnector(connector: AbstractConnector) {
  if (
    connector &&
    connector instanceof WalletConnectConnector &&
    connector.walletConnectProvider?.wc?.uri
  ) {
    connector.walletConnectProvider = undefined
  }
}

export async function disconnectWalletConnector(connector: AbstractConnector) {
  if (
    connector &&
    connector instanceof WalletConnectConnector &&
    connector.walletConnectProvider?.wc?.uri
  ) {
    try {
      await connector.walletConnectProvider.disconnect()
    } catch (ex) {
      console.log(ex)
    }
  }
}

const isMainnet = NETWORK.getNetworkName() === 'mainnet'

export const fortmatic = new FortmaticConnector({
  apiKey: isMainnet ? 'pk_live_B3A1A25FBF96DCB5' : 'pk_test_4F838B34CAE38BC8',
  chainId: isMainnet ? MAINNET : RINKEBY,
})

export const portis = new PortisConnector({
  dAppId: 'bbff3259-d19c-4791-9695-5a61f3146e51',
  networks: [1, 100],
})

export const torus = new TorusConnector({
  chainId: isMainnet ? MAINNET : RINKEBY,
  initOptions: {
    buildEnv: isMainnet ? 'production' : 'testing',
    network: {
      host: isMainnet ? 'mainnet' : 'rinkeby',
      chainId: isMainnet ? MAINNET : RINKEBY,
    },
    showTorusButton: false,
    useLocalStorage: true,
  },
})

export enum ConnectorIds {
  Injected = 1,
  Metamask = 1,
  WalletConnect = 2,
  Fortmatic = 3,
  WalletLink = 4,
  Coinbase = 4,
  Portis = 5,
  Torus = 6,
}

export const connectorsById: { [connectorName in ConnectorIds]: any } = {
  [ConnectorIds.Injected]: injected,
  [ConnectorIds.Metamask]: injected,
  [ConnectorIds.WalletConnect]: walletconnect,
  [ConnectorIds.WalletLink]: walletlink,
  [ConnectorIds.Coinbase]: walletlink,
  [ConnectorIds.Fortmatic]: fortmatic,
  [ConnectorIds.Portis]: portis,
  [ConnectorIds.Torus]: torus,
}
