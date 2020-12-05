import * as ErrorCodes from '../errorCodes'
import Web3 from 'web3'

export async function connect(): Promise<Web3> {
  if (!isAvailable()) {
    throw ErrorCodes.NOT_AVAILABLE
  }
  const anyWindow = window as any
  anyWindow.web3 = new Web3(anyWindow.ethereum)

  try {
    await anyWindow.ethereum.enable()
  } catch (ex) {
    switch (ex.code) {
      case -32002:
        throw ErrorCodes.ALREADY_PENDING
      case 4001:
        throw ErrorCodes.USER_REJECTED
      default:
        throw ErrorCodes.UNKNOWN_ERROR
    }
  }

  return anyWindow.web3
}

export async function disconnect(): Promise<void> {}

export function isAvailable(): boolean {
  const anyWindow = window as any
  if (anyWindow.ethereum && anyWindow.ethereum.isMetaMask) {
    return true
  }
  return false
}

export function isConnected(): boolean {
  const anyWindow = window as any
  if (anyWindow.ethereum && anyWindow.ethereum.selectedAddress !== null) {
    return true
  }
  return false
}

export function setOption(option: number, value: any): void {
  throw ErrorCodes.OPTION_NOT_AVAILABLE
}
