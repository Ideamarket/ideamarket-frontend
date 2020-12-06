import * as Wallets from './wallets'
import * as ErrorCodes from './errorCodes'
import * as Options from './options'
import * as Chains from './chains'
import * as Metamask from './implementations/metamask'
import * as WalletConnect from './implementations/walletConnect'
import * as Fortmatic from './implementations/fortmatic'
import * as Coinbase from './implementations/coinbase'
import * as Portis from './implementations/portis'
import Web3 from 'web3'

export async function connect(wallet: number): Promise<Web3> {
  switch (wallet) {
    case Wallets.METAMASK:
      return Metamask.connect()
    case Wallets.WALLETCONNECT:
      return WalletConnect.connect()
    case Wallets.FORTMATIC:
      return Fortmatic.connect()
    case Wallets.COINBASE:
      return Coinbase.connect()
    case Wallets.PORTIS:
      return Portis.connect()
    default:
      throw ErrorCodes.UNKNOWN_WALLET
  }
}

export async function disconnect(wallet: number): Promise<void> {
  switch (wallet) {
    case Wallets.METAMASK:
      return Metamask.disconnect()
    case Wallets.WALLETCONNECT:
      return WalletConnect.disconnect()
    case Wallets.FORTMATIC:
      return Fortmatic.disconnect()
    case Wallets.COINBASE:
      return Coinbase.disconnect()
    case Wallets.PORTIS:
      return Portis.disconnect()
    default:
      throw ErrorCodes.UNKNOWN_WALLET
  }
}

export async function isAvailable(wallet: number): Promise<boolean> {
  switch (wallet) {
    case Wallets.METAMASK:
      return Metamask.isAvailable()
    case Wallets.WALLETCONNECT:
      return WalletConnect.isAvailable()
    case Wallets.FORTMATIC:
      return Fortmatic.isAvailable()
    case Wallets.COINBASE:
      return Coinbase.isAvailable()
    case Wallets.PORTIS:
      return Portis.isAvailable()
    default:
      throw ErrorCodes.UNKNOWN_WALLET
  }
}

export async function isConnected(wallet: number): Promise<boolean> {
  switch (wallet) {
    case Wallets.METAMASK:
      return Metamask.isConnected()
    case Wallets.WALLETCONNECT:
      return WalletConnect.isConnected()
    case Wallets.FORTMATIC:
      return Fortmatic.isConnected()
    case Wallets.COINBASE:
      return Coinbase.isConnected()
    case Wallets.PORTIS:
      return Portis.isConnected()
    default:
      throw ErrorCodes.UNKNOWN_WALLET
  }
}

/* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
export async function setOption(
  wallet: number,
  option: number,
  value: any
): Promise<void> {
  switch (wallet) {
    case Wallets.METAMASK:
      return Metamask.setOption(option, value)
    case Wallets.WALLETCONNECT:
      return WalletConnect.setOption(option, value)
    case Wallets.FORTMATIC:
      return Fortmatic.setOption(option, value)
    case Wallets.COINBASE:
      return Coinbase.setOption(option, value)
    case Wallets.PORTIS:
      return Portis.setOption(option, value)
    default:
      throw ErrorCodes.UNKNOWN_WALLET
  }
}

export const ERROR_CODES = ErrorCodes
export const WALLETS = Wallets
export const OPTIONS = Options
export const CHAINS = Chains
