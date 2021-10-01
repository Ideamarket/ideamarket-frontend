import { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { setWeb3 } from 'store/walletStore'

import { injected, connectorsById } from './connectors/index'
import { useCustomSession } from 'utils/useCustomSession'

export function useEagerConnect() {
  const { activate, active, library } = useWeb3React()
  const { session, loading, refetchSession } = useCustomSession()

  const [tried, setTried] = useState(false)

  useEffect(() => {
    let isCancelled = false

    async function run() {
      const walletStr = localStorage.getItem('WALLET_TYPE')
      // If connected before, connect back
      if (walletStr) {
        const previousConnector = connectorsById[parseInt(walletStr)]
        if (
          previousConnector.isAuthorized &&
          (await previousConnector.isAuthorized())
        ) {
          if (isCancelled) {
            return
          }

          activate(previousConnector).catch(() => {
            setTried(true)
          })
        }
      }
    }

    run()

    return () => {
      isCancelled = true
    }
  }, [activate])

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (!tried && !loading && active) {
      setWeb3(library, undefined, session, refetchSession)
      setTried(true)
    }
  }, [tried, active, library, session, refetchSession, loading])

  return tried
}

export function useInactiveListener(suppress: boolean = false) {
  const { active, error, activate } = useWeb3React()

  useEffect((): any => {
    const { ethereum } = window as any
    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleConnect = () => {
        activate(injected)
      }

      ethereum.on('connect', handleConnect)

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('connect', handleConnect)
        }
      }
    }
  }, [active, error, suppress, activate])
}
