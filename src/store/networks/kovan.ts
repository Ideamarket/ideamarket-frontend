import { INetworkSpecifics, ExternalAddresses } from '.'
import DeployedAddressesKovan from '../../assets/deployed-kovan.json'
import DeployedABIsKovan from '../../assets/abis-kovan.json'
import TokenListKovan from '../../assets/token-list-kovan.json'

export default class KovanNetworkSpecifics implements INetworkSpecifics {
  getNetworkName(): string {
    return 'kovan'
  }

  getChainID(): number {
    return 42
  }

  getDeployedAddresses(): any {
    return DeployedAddressesKovan
  }

  getDeployedABIs(): any {
    return DeployedABIsKovan
  }

  getExternalAddresses(): ExternalAddresses {
    return {
      dai: '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
      cDai: '0xF0d0EB522cfa50B716B3b1604C4F0fA6f04376AD',
      weth: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
    }
  }

  getTokenList(): any {
    return TokenListKovan
  }

  getSubgraphURL(): string {
    return 'https://subgraph-kovan.backend.ideamarket.io/subgraphs/name/Ideamarket/IdeamarketKOVAN'
  }

  getEtherscanTxUrl(tx: string): string {
    return `https://kovan.etherscan.io/tx/${tx}`
  }
}
