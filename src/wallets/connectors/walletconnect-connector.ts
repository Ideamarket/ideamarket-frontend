import type { EventEmitter } from 'events'
import type WalletConnectProvider from '@walletconnect/ethereum-provider'
import type { IWCEthRpcConnectionOptions } from '@walletconnect/types'
import type { State, StoreApi } from 'zustand/vanilla'

export interface Web3ReactState extends State {
  chainId: number | undefined
  accounts: string[] | undefined
  activating: boolean
  error: Error | undefined
}

export type Web3ReactStore = StoreApi<Web3ReactState>

export interface Actions {
  startActivation: () => void
  update: (state: Partial<Pick<Web3ReactState, 'chainId' | 'accounts'>>) => void
  reportError: (error: Error) => void
}

// per EIP-1193
export interface RequestArguments {
  readonly method: string
  readonly params?: readonly unknown[] | object
}

// per EIP-1193
export interface Provider extends EventEmitter {
  request(args: RequestArguments): Promise<unknown>
}

export abstract class Connector {
  protected readonly actions: Actions
  public provider: Provider | undefined
  public deactivate?(): Promise<void>

  constructor(actions: Actions) {
    this.actions = actions
  }

  public abstract activate(): Promise<void>
}

interface MockWalletConnectProvider
  extends Omit<WalletConnectProvider, 'on' | 'off' | 'once' | 'removeListener'>,
    EventEmitter {}

export class WalletConnect extends Connector {
  private readonly options?: IWCEthRpcConnectionOptions
  private providerPromise?: Promise<void>

  public provider: MockWalletConnectProvider | undefined

  constructor(
    actions: Actions,
    options?: IWCEthRpcConnectionOptions,
    connectEagerly = true
  ) {
    super(actions)
    this.options = options

    if (connectEagerly) {
      this.providerPromise = this.startListening(connectEagerly)
    }
  }

  private async startListening(connectEagerly: boolean): Promise<void> {
    const WalletConnectProvider = (await import(
      '@walletconnect/ethereum-provider'
    ).then((m) => m?.default ?? m)) as any

    this.provider = new WalletConnectProvider(
      this.options
    ) as unknown as MockWalletConnectProvider

    this.provider.on('disconnect', (error: Error): void => {
      this.actions.reportError(error)
    })
    this.provider.on('chainChanged', (chainId: number): void => {
      this.actions.update({ chainId })
    })
    this.provider.on('accountsChanged', (accounts: string[]): void => {
      this.actions.update({ accounts })
    })

    // silently attempt to eagerly connect
    if (connectEagerly && this.provider.connected) {
      Promise.all([
        this.provider.request({ method: 'eth_chainId' }) as Promise<number>,
        this.provider.request({ method: 'eth_accounts' }) as Promise<string[]>,
      ])
        .then(([chainId, accounts]) => {
          if (accounts.length > 0) {
            this.actions.update({ chainId, accounts })
          }
        })
        .catch((error) => {
          console.debug('Could not connect eagerly', error)
        })
    }
  }

  public async activate(): Promise<void> {
    this.actions.startActivation()

    if (!this.providerPromise) {
      this.providerPromise = this.startListening(false)
    }
    await this.providerPromise
    // this.provider guaranteed to be defined now

    await Promise.all([
      (this.provider as Provider).request({
        method: 'eth_chainId',
      }) as Promise<number>,
      (this.provider as Provider).request({
        method: 'eth_requestAccounts',
      }) as Promise<string[]>,
    ])
      .then(([chainId, accounts]) => {
        this.actions.update({ chainId, accounts })
      })
      .catch((error) => {
        this.actions.reportError(error)
      })
  }

  public async deactivate(): Promise<void> {
    if (this.provider) {
      await this.provider.disconnect()
    }
  }
}
