import { useEffect, useState } from 'react'
import { hooks, phantom } from '../../connectors/phantom'
import { Card } from '../Card'

const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } = hooks

export default function PhantomCard() {
  const chainId = useChainId()
  const accounts = useAccounts()
  const isActivating = useIsActivating()

  const isActive = useIsActive()

  const provider = useProvider()
  const ENSNames = useENSNames(provider)

  const [error, setError] = useState(undefined)

  // attempt to connect eagerly on mount
  useEffect(() => {
    void phantom.connectEagerly().catch(() => {
      console.debug('Failed to connect eagerly to phantom')
    })
  }, [])

  return (
    <Card
      connector={phantom}
      chainId={chainId}
      isActivating={isActivating}
      isActive={isActive}
      error={error}
      setError={setError}
      accounts={accounts}
      provider={provider}
      ENSNames={ENSNames}
    />
  )
}
