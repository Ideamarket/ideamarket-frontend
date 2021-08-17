import { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { setWeb3 } from 'store/walletStore'

import { injected, connectorsById } from './connectors/index'

export function useEagerConnect() {
  const { activate, active, library } = useWeb3React()

  const [tried, setTried] = useState(false)

  useEffect(() => {
    let isCancelled = false

    async function run() {
      const walletStr = localStorage.getItem('WALLET_TYPE')
      console.log('walletStr==', walletStr)
      // If connected before, connect back
      if (walletStr) {
        const previousConnector = connectorsById[parseInt(walletStr)]
        if (
          walletStr === '6' || // Torus connector does not have isAuthorized method
          (previousConnector.isAuthorized &&
            (await previousConnector.isAuthorized()))
        ) {
          if (isCancelled) {
            console.log('was canceled')
            return
          }

          console.log('active using previousConnector==', previousConnector)
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
  }, [])

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (!tried && active) {
      console.log('now active, so set web3')
      setWeb3(library, undefined)
      setTried(true)
    }
  }, [tried, active])

  return tried
}

export function useInactiveListener(suppress: boolean = false) {
  const { active, error, activate } = useWeb3React()

  useEffect((): any => {
    const { ethereum } = window as any
    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleConnect = () => {
        console.log('handleConnect')
        activate(injected)
      }
      const handleChainChanged = (chainId: string | number) => {
        console.log('handleChainChanged')
        activate(injected)
      }
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          console.log('handleAccountsChanged')
          activate(injected)
        }
      }
      const handleNetworkChanged = (networkId: string | number) => {
        console.log('handleNetworkChanged')
        activate(injected)
      }

      ethereum.on('connect', handleConnect)
      ethereum.on('chainChanged', handleChainChanged)
      ethereum.on('accountsChanged', handleAccountsChanged)
      ethereum.on('networkChanged', handleNetworkChanged)

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('connect', handleConnect)
          ethereum.removeListener('chainChanged', handleChainChanged)
          ethereum.removeListener('accountsChanged', handleAccountsChanged)
          ethereum.removeListener('networkChanged', handleNetworkChanged)
        }
      }
    }
  }, [active, error, suppress, activate])
}
