import { INetworkSpecifics, ExternalAddresses, AddNetworkParams } from '.'
import DeployedAddressesTest from '../../assets/deployed-test.json'
import DeployedABIsTest from '../../assets/abis-test.json'
import TokenListRinkeby from '../../assets/token-list-rinkeby.json'

export default class TestNetworkSpecifics implements INetworkSpecifics {
  getNetworkName(): string {
    return 'test'
  }

  getHumanReadableNetworkName(): string {
    return 'Rinkeby'
  }

  getChainID(): number {
    return 4
  }

  getDeployedAddresses(): any {
    return DeployedAddressesTest
  }

  getDeployedABIs(): any {
    return DeployedABIsTest
  }

  getExternalAddresses(): ExternalAddresses {
    return {
      dai: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
      cDai: '0x6D7F0754FFeb405d23C51CE938289d4835bE3b14',
      weth: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
    }
  }

  getTokenList(): any {
    return TokenListRinkeby
  }

  getSubgraphURL(): string {
    return 'https://subgraph-test.backend.ideamarket.io/subgraphs/name/Ideamarket/IdeamarketTEST'
  }

  getEtherscanTxUrl(tx: string): string {
    return `https://rinkeby.etherscan.io/tx/${tx}`
  }

  getAddNetworkParams(): AddNetworkParams | undefined {
    return undefined
  }

  getRPCURL(): string {
    return 'https://rinkeby.infura.io/v3/98ca28d50f234e618a22a8b0d83c40b2'
  }
}
