import * as ErrorCodes from '../errorCodes'
import * as Options from '../options'
import Portis from '@portis/web3'
import Web3 from 'web3'
import { CHAINS } from 'wallets'

let instance: Portis | undefined = undefined
let apiKey = ''
let chain = 'mainnet'

export async function connect(): Promise<Web3> {
  const portis = new Portis(apiKey, chain)

  if ((await portis.isLoggedIn()).result != true) {
    await portis.showPortis()

    if ((await portis.isLoggedIn()).result != true) {
      throw ErrorCodes.USER_REJECTED
    }
  }

  instance = portis
  const web3 = new Web3(portis.provider)
  return web3
}

export async function disconnect(): Promise<void> {
  await (instance as Portis).logout()
  instance = undefined
}

export function isAvailable(): boolean {
  return true
}

export async function isConnected(): Promise<boolean> {
  if (instance) {
    return true
  }

  const tmp = new Portis(apiKey, chain)
  return (await tmp.isLoggedIn()).result
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
