import { INetworkSpecifics, ExternalAddresses } from '.'
import DeployedAddressesRinkeby from '../../assets/deployed-rinkeby.json'
import DeployedABIsRinkeby from '../../assets/abis-rinkeby.json'
import TokenListRinkeby from '../../assets/token-list-rinkeby.json'

export default class RinkebyNetworkSpecifics implements INetworkSpecifics {
  getNetworkName(): string {
    return 'rinkeby'
  }

  getChainID(): number {
    return 4
  }

  getDeployedAddresses(): any {
    return DeployedAddressesRinkeby
  }

  getDeployedABIs(): any {
    return DeployedABIsRinkeby
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
    return 'https://subgraph-rinkeby.backend.ideamarket.io/subgraphs/name/Ideamarket/IdeamarketRINKEBY'
  }

  getEtherscanTxUrl(tx: string): string {
    return `https://rinkeby.etherscan.io/tx/${tx}`
  }
}
