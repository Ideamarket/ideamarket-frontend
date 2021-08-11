import MainnetNetworkSpecifics from './mainnet'
import RinkebyNetworkSpecifics from './rinkeby'
import KovanNetworkSpecifics from './kovan'
import TestNetworkSpecifics from './test'
import KovanAVMNetworkSpecifics from './kovanAVM'

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
  new KovanAVMNetworkSpecifics(),
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

// TODO: Complete
export function getL1Network(l2Network: INetworkSpecifics) {
  switch (l2Network.getNetworkName()) {
    case 'kovan':
      return getNetworkSpecificsByNetworkName('kovan')
    default:
      throw Error('getL1Network: missing')
  }
}

if (!process.env.NEXT_PUBLIC_NETWORK) {
  console.log('WARNING: NEXT_PUBLIC_NETWORK not found. Defaulting to rinkeby')
}

const networkName = process.env.NEXT_PUBLIC_NETWORK
  ? process.env.NEXT_PUBLIC_NETWORK
  : 'rinkeby'

export const NETWORK = getNetworkSpecificsByNetworkName(networkName)
export const L1_NETWORK = getL1Network(NETWORK)

if (!NETWORK) {
  throw Error('no network config: ' + networkName)
}
