import CoinbaseWalletCard from '../components/connectorCards/CoinbaseWalletCard'
import GnosisSafeCard from '../components/connectorCards/GnosisSafeCard'
import WalletConnectCard from '../components/connectorCards/WalletConnectCard'
import PhantomCard from '../components/connectorCards/PhantomCard'
import ProviderExample from '../components/ProviderExample'

export default function Home() {
  return (
    <>
      <ProviderExample />
      <div style={{ display: 'flex', flexFlow: 'wrap', fontFamily: 'sans-serif' }}>
        <WalletConnectCard />
        <CoinbaseWalletCard />
        <GnosisSafeCard /> 
        <PhantomCard />
      </div>
    </>
  )
}
