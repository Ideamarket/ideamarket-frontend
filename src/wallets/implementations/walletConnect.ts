import * as ErrorCodes from '../errorCodes'
import * as Options from '../options'
import Web3 from 'web3'
import WalletConnectProvider from '@walletconnect/web3-provider'

let infuraKey = ''

export async function connect(): Promise<Web3> {
  if (infuraKey === '') {
    throw ErrorCodes.MISSING_OPTION_INFURA_KEY
  }

  const provider = new WalletConnectProvider({
    infuraId: infuraKey,
  })

  try {
    await provider.enable()
  } catch (ex) {
    if (ex.message.includes('User closed modal')) {
      throw ErrorCodes.USER_REJECTED
    } else {
      throw ErrorCodes.UNKNOWN_ERROR
    }
  }

  return new Web3(provider as any)
}

export async function disconnect(): Promise<void> {
  const provider = new WalletConnectProvider({
    infuraId: infuraKey,
  })

  try {
    await provider.disconnect()
  } catch (ex) {
    throw ErrorCodes.UNKNOWN_ERROR
  }
}

export function isAvailable(): boolean {
  return true
}

export function isConnected(): boolean {
  if (infuraKey === '') {
    throw ErrorCodes.MISSING_OPTION_INFURA_KEY
  }

  const anyWindow = window as any
  if (anyWindow.ethereum && anyWindow.ethereum.selectedAddress !== null) {
    return true
  }
  return false
}

/* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
export function setOption(option: number, value: any): void {
  switch (option) {
    case Options.INFURA_KEY:
      infuraKey = value
      return
    default:
      throw ErrorCodes.OPTION_NOT_AVAILABLE
  }
}
