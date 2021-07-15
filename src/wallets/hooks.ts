import { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { setWeb3 } from 'store/walletStore'

import { injected, connectorsById } from './connectors/index'

type SendReturnResult = { result: any }
type SendReturn = any
type Send = (
  method: string,
  params?: any[]
) => Promise<SendReturnResult | SendReturn>

export function useEagerConnect() {
  const { activate, active, library } = useWeb3React()

  const [tried, setTried] = useState(false)

  useEffect(() => {
    function parseSendReturn(sendReturn: SendReturnResult | SendReturn): any {
      return sendReturn.hasOwnProperty('result')
        ? sendReturn.result
        : sendReturn
    }

    async function isAuthorized(): Promise<boolean> {
      const anyWindow = window as any
      if (!anyWindow.ethereum) {
        return false
      }

      try {
        return await (anyWindow.ethereum.send as Send)('eth_accounts').then(
          (sendReturn) => {
            if (parseSendReturn(sendReturn).length > 0) {
              return true
            } else {
              return false
            }
          }
        )
      } catch {
        return false
      }
    }

    let isCancelled = false

    async function run() {
      const walletStr = localStorage.getItem('WALLET_TYPE')
      // If connected before, connect back
      if (walletStr) {
        const previousConnector = connectorsById[parseInt(walletStr)]
        if (await isAuthorized()) {
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
  }, [])

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (!tried && active) {
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
        activate(injected)
      }
      const handleChainChanged = (chainId: string | number) => {
        activate(injected)
      }
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          activate(injected)
        }
      }
      const handleNetworkChanged = (networkId: string | number) => {
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
