import MainnetNetworkSpecifics from './mainnet'
import RinkebyNetworkSpecifics from './rinkeby'
import TestNetworkSpecifics from './test'
import TestAVML1NetworkSpecifics from './test-avm-l1'
import TestAVML2NetworkSpecifics from './test-avm-l2'

export type ExternalAddresses = {
  dai: string
  cDai: string
  weth: string
}

export type AddNetworkParams = {
  chainId: string
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: string[]
  blockExplorerUrls: string[]
}

export type INetworkSpecifics = {
  getNetworkName(): string
  getHumanReadableNetworkName(): string
  getChainID(): number
  getDeployedAddresses(): any
  getDeployedABIs(): any
  getExternalAddresses(): ExternalAddresses
  getTokenList(): any
  getSubgraphURL(): string
  getEtherscanTxUrl(tx: string): string
  getAddNetworkParams(): AddNetworkParams | undefined
}

const specifics: INetworkSpecifics[] = [
  new MainnetNetworkSpecifics(),
  new RinkebyNetworkSpecifics(),
  new TestNetworkSpecifics(),
  new TestAVML1NetworkSpecifics(),
  new TestAVML2NetworkSpecifics(),
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

export function getL1Network(l2Network: INetworkSpecifics) {
  switch (l2Network.getNetworkName()) {
    case 'test-avm-l2':
      return getNetworkSpecificsByNetworkName('test-avm-l1')
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
