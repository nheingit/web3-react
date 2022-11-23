import { initializeConnector } from '@web3-react/core'
import { MetaMask } from '../../metamask'

export const [metaMask, hooks] = initializeConnector<MetaMask>((actions) => new MetaMask({ actions }))
