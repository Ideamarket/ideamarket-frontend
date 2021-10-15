import AVMNetworkSpecifics from './avm'
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
  getRPCURL(): string
}

const specifics: INetworkSpecifics[] = [
  new AVMNetworkSpecifics(),
  new MainnetNetworkSpecifics(),
  new RinkebyNetworkSpecifics(),
  new TestNetworkSpecifics(),
  new TestAVML1NetworkSpecifics(),
  new TestAVML2NetworkSpecifics(),
]

export function getNetworkSpecifics(): INetworkSpecifics[] {
  return specifics
}

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
  // Sometimes network passed in is L1Network
  switch (l2Network.getNetworkName()) {
    case 'avm':
    case 'mainnet':
      return getNetworkSpecificsByNetworkName('mainnet')
    case 'test-avm-l2':
    case 'test-avm-l1':
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
  : 'test-avm-l2'

// Gets network based on NEXT_PUBLIC_NETWORK environment variable
export const NETWORK = getNetworkSpecificsByNetworkName(networkName)
export const L1_NETWORK = getL1Network(NETWORK)

if (!NETWORK) {
  throw Error('no network config: ' + networkName)
}
