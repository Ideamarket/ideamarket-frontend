import { INetworkSpecifics, ExternalAddresses, AddNetworkParams } from '.'
import DeployedAddressesTestAVML2 from '../../assets/deployed-test-avm-l2.json'
import DeployedABIsTestAVML2 from '../../assets/abis-test-avm-l2.json'
import TokenListTestAVML2 from '../../assets/token-list-test-avm-l2.json'

export default class TestAVML2NetworkSpecifics implements INetworkSpecifics {
  getNetworkName(): string {
    return 'test-avm-l2'
  }

  getHumanReadableNetworkName(): string {
    return 'Arbitrum Rinkeby'
  }

  getChainID(): number {
    return 421611
  }

  getDeployedAddresses(): any {
    return DeployedAddressesTestAVML2
  }

  getDeployedABIs(): any {
    return DeployedABIsTestAVML2
  }

  getExternalAddresses(): ExternalAddresses {
    return {
      imo: '0x634a0900a5F90C9F2d42BF1d49d94B84Db0A260d',
      dai: '0x5364Dc963c402aAF150700f38a8ef52C1D7D7F14',
      cDai: '0x0000000000000000000000000000000000000001',
      weth: '0xb47e6a5f8b33b3f17603c83a0535a9dcd7e32681',
    }
  }

  getTokenList(): any {
    return TokenListTestAVML2
  }

  getSubgraphURL(): string {
    return 'https://subgraph-test-avm-l2.backend.ideamarket.io/subgraphs/name/Ideamarket/IdeamarketTESTAVML2'
  }

  getUserMarketSubgraphURL(): string {
    return 'https://subgraph-test-avm-l2.backend.ideamarket.io/subgraphs/name/Ideamarket/IdeamarketTESTAVML2IMOMARKET'
  }

  getEtherscanTxUrl(tx: string): string {
    return `https://rinkeby-explorer.arbitrum.io/tx/${tx}`
  }

  getAddNetworkParams(): AddNetworkParams | undefined {
    return {
      chainId: '0x66EEB',
      chainName: 'Arbitrum Rinkeby',
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: ['https://rinkeby.arbitrum.io/rpc'],
      blockExplorerUrls: ['https://rinkeby-explorer.arbitrum.io/#/'],
    }
  }

  getRPCURL(): string {
    return 'https://arbitrum-rinkeby.infura.io/v3/628f48a852c5452597813331041ee3a4'
  }
}
