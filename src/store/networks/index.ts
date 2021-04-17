import MainnetNetworkSpecifics from './mainnet'
import RinkebyNetworkSpecifics from './rinkeby'
import KovanNetworkSpecifics from './kovan'
import TestNetworkSpecifics from './test'

export type ExternalAddresses = {
  dai: string
  cDai: string
  weth: string
}

export type INetworkSpecifics = {
  getNetworkName(): string
  getChainID(): number
  getDeployedAddresses(): any
  getDeployedABIs(): any
  getExternalAddresses(): ExternalAddresses
  getTokenList(): any
  getSubgraphURL(): string
  getEtherscanTxUrl(tx: string): string
}

const specifics: INetworkSpecifics[] = [
  new MainnetNetworkSpecifics(),
  new RinkebyNetworkSpecifics(),
  new KovanNetworkSpecifics(),
  new TestNetworkSpecifics(),
]

export function getNetworkSpecificsByNetworkName(
  networkName: string
): INetworkSpecifics {
  for (const s of specifics) {
    if (s.getNetworkName() === networkName) {
      return s
    }
  }
}

if (!process.env.NEXT_PUBLIC_NETWORK) {
  console.log('WARNING: NEXT_PUBLIC_NETWORK not found. Defaulting to rinkeby')
}

const networkName = process.env.NEXT_PUBLIC_NETWORK
  ? process.env.NEXT_PUBLIC_NETWORK
  : 'rinkeby'

export const NETWORK = getNetworkSpecificsByNetworkName(networkName)

if (!NETWORK) {
  throw 'no network config: ' + networkName
}
