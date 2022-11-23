import type { Actions, Provider, ProviderConnectInfo, ProviderRpcError } from '@web3-react/types'
import { Connector } from '@web3-react/types'
import type detectEthereumProvider from './utils'

function parseChainId(chainId: string | number) {
  return typeof chainId === 'string' ? Number.parseInt(chainId, 16) : chainId
}

type PhantomProvider = Provider & { isPhantom?: boolean; isConnected?: () => boolean; providers?: PhantomProvider[] }

/**
 * @param provider - An EIP-1193 ({@link https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md}) provider.
 * @param onError - Handler to report errors thrown from eventListeners.
 */
export interface PhantomConstructorArgs {
  actions: Actions
  options?: Parameters<typeof detectEthereumProvider>[0]
  onError?: (error: Error) => void
}

export class NoPhantomError extends Error {
  public constructor() {
    super("Phantom is not installed")
    this.name = NoPhantomError.name
    Object.setPrototypeOf(this, NoPhantomError.prototype)
  }
}

export class Phantom extends Connector {
  /** {@inheritdoc Connector.provider} */
  provider?: PhantomProvider

  private readonly options?: Parameters<typeof detectEthereumProvider>[0]
  private eagerConnection?: Promise<void>

  constructor({ actions, options, onError }: PhantomConstructorArgs) {
    super(actions, onError)
    this.options = options
  }

  private async isomorphicInitialize(): Promise<void> {
    if (this.eagerConnection) return

    return (this.eagerConnection = import('./utils').then(async (m) => {
      const provider = await m.default(this.options)
      if (provider) {
        this.provider = provider as PhantomProvider

        // handle the case when e.g. phantom and coinbase wallet are both installed
        if (this.provider.providers?.length) {
          this.provider = this.provider.providers.find((p) => p.isPhantom) ?? this.provider.providers[0]
        }

        this.provider.on('connect', ({ chainId }: ProviderConnectInfo): void => {
          this.actions.update({ chainId: parseChainId(chainId) })
        })

        this.provider.on('disconnect', (error: ProviderRpcError): void => {
          this.actions.resetState()
          this.onError?.(error)
        })

        this.provider.on('chainChanged', (chainId: string): void => {
          this.actions.update({ chainId: parseChainId(chainId) })
        })

        this.provider.on('accountsChanged', (accounts: string[]): void => {
          if (accounts.length === 0) {
            // handle this edge case by disconnecting
            this.actions.resetState()
          } else {
            this.actions.update({ accounts })
          }
        })
      }
    }))
  }

  /** {@inheritdoc Connector.connectEagerly} */
  public async connectEagerly(): Promise<void> {
    const cancelActivation = this.actions.startActivation()

    await this.isomorphicInitialize()
    if (!this.provider) return cancelActivation()

    return Promise.all([
      this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
      this.provider.request({ method: 'eth_accounts' }) as Promise<string[]>,
    ])
      .then(([chainId, accounts]) => {
        this.actions.update({ chainId: parseChainId(chainId), accounts })
      })
      .catch((error) => {
        cancelActivation()
        throw error
      })
  }

  /** {@inheritdoc Connector.activate} */
  public async activate(): Promise<void> {
    let cancelActivation: () => void
    if (!this.provider?.isConnected?.()) cancelActivation = this.actions.startActivation()
    
      return this.isomorphicInitialize()
        .then(async () => {
          if (!this.provider) throw new NoPhantomError()

          return Promise.all([
            this.provider.request({ method: 'eth_chainId' }) as Promise<string>,
            this.provider.request({ method: 'eth_requestAccounts' }) as Promise<string[]>,
          ]).then(([chainId, accounts]) => {
            return this.actions.update({ chainId: parseChainId(chainId), accounts})
          })
        })
        .catch((error) => {
          cancelActivation?.()
          throw error
        })
  }
}
