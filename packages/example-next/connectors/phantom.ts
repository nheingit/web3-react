import { initializeConnector } from '@web3-react/core'
import { Phantom } from '../../phantom'

export const [phantom, hooks] = initializeConnector<Phantom>((actions) => new Phantom({ actions}))
