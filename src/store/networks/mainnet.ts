import { INetworkSpecifics, ExternalAddresses, AddNetworkParams } from '.'
import DeployedAddressesMainnet from '../../assets/deployed-mainnet.json'
import DeployedABIsMainnet from '../../assets/abis-mainnet.json'
import TokenListMainnet from '../../assets/token-list-mainnet.json'

export default class MainnetNetworkSpecifics implements INetworkSpecifics {
  getNetworkName(): string {
    return 'mainnet'
  }

  getHumanReadableNetworkName(): string {
    return 'Ethereum'
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
    return 'https://subgraph-l1.backend.ideamarket.io/subgraphs/name/Ideamarket/IdeamarketL1'
  }

  getEtherscanTxUrl(tx: string): string {
    return `https://etherscan.io/tx/${tx}`
  }

  getAddNetworkParams(): AddNetworkParams | undefined {
    return undefined
  }

  getRPCURL(): string {
    return 'https://mainnet.infura.io/v3/98ca28d50f234e618a22a8b0d83c40b2'
  }
}
