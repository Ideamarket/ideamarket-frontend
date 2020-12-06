import * as ErrorCodes from '../errorCodes'
import * as Options from '../options'
import FM from 'fortmatic'
import Web3 from 'web3'
import { WidgetMode } from 'fortmatic/dist/cjs/src/core/sdk'
import { CHAINS } from 'wallets'

let apiKey = ''
let chain = 'mainnet'

export async function connect(): Promise<Web3> {
  const fm = getFMInstance()
  try {
    await fm.user.login()
  } catch (ex) {
    if (ex.message.includes('User denied')) {
      throw ErrorCodes.USER_REJECTED
    } else {
      throw ErrorCodes.UNKNOWN_ERROR
    }
  }

  return new Web3(fm.getProvider() as any)
}

export async function disconnect(): Promise<void> {
  const fm = getFMInstance()
  await fm.user.logout()
}

export function isAvailable(): boolean {
  return true
}

export async function isConnected(): Promise<boolean> {
  const fm = getFMInstance()
  return await fm.user.isLoggedIn()
}

export function setOption(option: number, value: any): void {
  switch (option) {
    case Options.API_KEY:
      apiKey = value
      return
    case Options.CHAIN:
      switch (value) {
        case CHAINS.MAINNET:
          chain = 'mainnet'
          return
        case CHAINS.RINKEBY:
          chain = 'rinkeby'
          return
        default:
          throw ErrorCodes.INVALID_OPTION_VALUE
      }
    default:
      throw ErrorCodes.OPTION_NOT_AVAILABLE
  }
}

function getFMInstance(): WidgetMode {
  let fm
  try {
    fm = new FM(apiKey, chain)
  } catch (ex) {
    throw ErrorCodes.UNKNOWN_ERROR
  }
  return fm
}
