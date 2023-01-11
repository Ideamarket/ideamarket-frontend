import { INetworkSpecifics, ExternalAddresses, AddNetworkParams } from '.'
import DeployedAddressesAVM from '../../assets/deployed-avm.json'
import DeployedABIsAVM from '../../assets/abis-avm.json'
import TokenListAVM from '../../assets/token-list-avm.json'

export default class AVMNetworkSpecifics implements INetworkSpecifics {
  getNetworkName(): string {
    return 'avm'
  }

  getHumanReadableNetworkName(): string {
    return 'Arbitrum'
  }

  getChainID(): number {
    return 42161
  }

  getDeployedAddresses(): any {
    return DeployedAddressesAVM
  }

  getDeployedABIs(): any {
    return DeployedABIsAVM
  }

  getExternalAddresses(): ExternalAddresses {
    return {
      imo: '0xB41bd4C99dA73510d9e081C5FADBE7A27Ac1F814',
      dai: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      cDai: '0x0000000000000000000000000000000000000001',
      weth: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    }
  }

  getTokenList(): any {
    return TokenListAVM
  }

  getSubgraphURL(): string {
    return 'https://subgraph.backend.ideamarket.io/subgraphs/name/Ideamarket/Ideamarket'
  }

  getUserMarketSubgraphURL(): string {
    return 'https://subgraph.backend.ideamarket.io/subgraphs/name/Ideamarket/IdeamarketAVMIMOMARKET'
  }

  getEtherscanTxUrl(tx: string): string {
    return `https://arbiscan.io/tx/${tx}`
  }

  getAddNetworkParams(): AddNetworkParams | undefined {
    return {
      chainId: '0xA4B1',
      chainName: 'Arbitrum',
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: ['https://arb1.arbitrum.io/rpc'],
      blockExplorerUrls: ['https://arbiscan.io/'],
    }
  }

  getRPCURL(): string {
    return 'https://arbitrum-mainnet.infura.io/v3/628f48a852c5452597813331041ee3a4'
  }
}
