import React, { useEffect, useContext } from 'react'
import { GlobalContext } from 'pages/_app'
import { useWalletStore } from 'store/walletStore'
import { NETWORK } from 'store/networks'

import dynamic from 'next/dynamic'

const NoSSRWalletInterface = dynamic(() => import('./WalletInterface'), {
  ssr: false,
})

export default function WrongNetworkOverlay() {
  const web3 = useWalletStore((state) => state.web3)
  const web3ChainID = useWalletStore((state) => state.chainID)
  const isWrongNetwork = NETWORK.getChainID() !== web3ChainID

  const show = web3 !== undefined && isWrongNetwork

  useEffect(() => {
    if (show) {
      window.scrollTo(0, 0)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [show])

  if (!show) {
    return <></>
  }

  return (
    <div className="absolute top-0 left-0 z-50 w-screen h-screen bg-gray-200 dark:bg-gray-800">
      <div className="flex items-center justify-center w-full h-full overflow-auto">
        <div className="flex flex-col items-center">
          <img
            className="block w-auto h-32 md:h-64"
            src="/logo.png"
            alt="Workflow logo"
          />
          <h1 className="mt-5 text-2xl md:text-3xl">
            Change network selection
          </h1>
          <div className="mt-10 text-sm">
            Your wallet is connected to the wrong network.
          </div>
          <div className="text-sm">
            Please connect to <strong>{NETWORK.getNetworkName()}</strong> and
            try again.
          </div>
          <div className="mt-5 bg-white dark:bg-gray-700 border dark:border-gray-500 rounded border-brand-gray-2">
            <NoSSRWalletInterface />
          </div>
        </div>
      </div>
    </div>
  )
}
