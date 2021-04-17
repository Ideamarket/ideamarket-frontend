import { INetworkSpecifics, ExternalAddresses } from '.'
import DeployedAddressesMainnet from '../../assets/deployed-mainnet.json'
import DeployedABIsMainnet from '../../assets/abis-mainnet.json'
import TokenListMainnet from '../../assets/token-list-mainnet.json'

export default class MainnetNetworkSpecifics implements INetworkSpecifics {
  getNetworkName(): string {
    return 'mainnet'
  }

  getChainID(): number {
    return 1
  }

  getDeployedAddresses(): any {
    return DeployedAddressesMainnet
  }

  getDeployedABIs(): any {
    return DeployedABIsMainnet
  }

  getExternalAddresses(): ExternalAddresses {
    return {
      dai: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      cDai: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
      weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    }
  }

  getTokenList(): any {
    return TokenListMainnet
  }

  getSubgraphURL(): string {
    return 'https://subgraph.backend.ideamarket.io/subgraphs/name/Ideamarket/Ideamarket'
  }

  getEtherscanTxUrl(tx: string): string {
    return `https://etherscan.io/tx/${tx}`
  }
}
