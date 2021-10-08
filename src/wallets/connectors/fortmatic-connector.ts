import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'
import invariant from 'tiny-invariant'
import { L1_NETWORK, NETWORK } from 'store/networks'
import router from 'next/router'

const chainIdToNetwork: { [network: number]: string } = {
  1: 'mainnet',
  3: 'ropsten',
  4: 'rinkeby',
  42: 'kovan',
  42161: 'arbitrumMainnet',
  421611: 'arbitrumTestnet',
}

interface FortmaticConnectorArguments {
  apiKey: string
  chainId: number
}

export class FortmaticConnector extends AbstractConnector {
  private readonly apiKey: string
  private readonly chainId: number

  public fortmatic: any

  constructor({ apiKey, chainId }: FortmaticConnectorArguments) {
    invariant(
      Object.keys(chainIdToNetwork).includes(chainId.toString()),
      `Unsupported chainId ${chainId}`
    )
    super({ supportedChainIds: [chainId] })

    this.apiKey = apiKey
    this.chainId = chainId
  }

  public async activate(): Promise<ConnectorUpdate> {
    const Fortmatic = (await import('fortmatic').then(
      (m) => m?.default ?? m
    )) as any

    const customNodeOptions = {
      rpcUrl:
        router.pathname === '/bridge'
          ? L1_NETWORK.getRPCURL()
          : NETWORK.getRPCURL(),
      chainId:
        router.pathname === '/bridge'
          ? L1_NETWORK.getChainID()
          : chainIdToNetwork[NETWORK.getChainID()],
    }

    this.fortmatic = new Fortmatic(this.apiKey, customNodeOptions)

    const account = await this.fortmatic
      .getProvider()
      .enable()
      .then((accounts: string[]): string => accounts[0])

    return {
      provider: this.fortmatic.getProvider(),
      chainId: this.chainId,
      account,
    }
  }

  public async getProvider(): Promise<any> {
    return this.fortmatic.getProvider()
  }

  public async getChainId(): Promise<number | string> {
    return this.chainId
  }

  public async getAccount(): Promise<null | string> {
    return this.fortmatic
      .getProvider()
      .send('eth_accounts')
      .then((accounts: string[]): string => accounts[0])
  }

  public deactivate() {}

  public async close() {
    await this.fortmatic.user.logout()
    this.emitDeactivate()
  }
}
