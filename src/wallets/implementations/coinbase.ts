import * as ErrorCodes from '../errorCodes'
import * as Options from '../options'
import WalletLink from 'walletlink'
import Web3 from 'web3'

let jsonRpcUrl = ''
let config = {}

export async function connect(): Promise<Web3> {
  const wl = getWalletLinkInstance()
  let provider
  try {
    provider = wl.makeWeb3Provider(jsonRpcUrl, 1)
  } catch (ex) {
    throw ErrorCodes.UNKNOWN_ERROR
  }

  try {
    await provider.enable()
  } catch (ex) {
    if (ex.message.includes('User denied')) {
      throw ErrorCodes.USER_REJECTED
    } else {
      throw ErrorCodes.UNKNOWN_ERROR
    }
  }

  return new Web3(provider)
}

export async function disconnect(): Promise<void> {
  const wl = getWalletLinkInstance()
  let provider
  try {
    provider = wl.makeWeb3Provider(jsonRpcUrl, 1)
  } catch (ex) {
    throw ErrorCodes.UNKNOWN_ERROR
  }

  try {
    wl.disconnect()
    provider.close()
  } catch (ex) {
    throw ErrorCodes.UNKNOWN_ERROR
  }
}

export function isAvailable(): boolean {
  return true
}

export async function isConnected(): Promise<boolean> {
  const wl = getWalletLinkInstance()
  let provider
  try {
    provider = wl.makeWeb3Provider(jsonRpcUrl, 1)
  } catch (ex) {
    throw ErrorCodes.UNKNOWN_ERROR
  }

  console.log(provider.selectedAddress)
  return provider.selectedAddress !== undefined
}

export function setOption(option: number, value: any): void {
  switch (option) {
    case Options.JSON_RPC_URL:
      jsonRpcUrl = value
      return
    case Options.COINBASE_CONFIG:
      config = value
      return
    default:
      throw ErrorCodes.OPTION_NOT_AVAILABLE
  }
}

function getWalletLinkInstance(): WalletLink {
  let wl: WalletLink
  try {
    wl = new WalletLink(config as any)
  } catch (ex) {
    throw ErrorCodes.UNKNOWN_ERROR
  }

  return wl
}
