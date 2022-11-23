import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { useWeb3React, Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { Phantom } from '@web3-react/phantom'
import { WalletConnect } from '@web3-react/walletconnect'
import { coinbaseWallet, hooks as coinbaseWalletHooks } from '../connectors/coinbaseWallet'
import { phantom, hooks as phantomHooks } from '../connectors/phantom'
import { hooks as metaMaskHooks, metaMask } from '../connectors/metaMask'
import { hooks as networkHooks, network } from '../connectors/network'
import { hooks as walletConnectHooks, walletConnect } from '../connectors/walletConnect'
import { getName } from '../utils'

const connectors: [Phantom, Web3ReactHooks][] = [[phantom, phantomHooks]]
// const connectors: [MetaMask | WalletConnect | CoinbaseWallet | Phantom | Network, Web3ReactHooks][] = [
//   [metaMask, metaMaskHooks],
//   [walletConnect, walletConnectHooks],
//   [coinbaseWallet, coinbaseWalletHooks],
//   [phantom, phantomHooks],
//   [network, networkHooks],
// ]

function Child() {
  const { connector } = useWeb3React()
  console.log(`Priority Connector is: ${getName(connector)}`)
  return null
}

export default function ProviderExample() {
  return (
    <Web3ReactProvider connectors={connectors}>
      <Child />
    </Web3ReactProvider>
  )
}
