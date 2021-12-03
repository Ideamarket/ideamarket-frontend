import React, { useCallback, useState } from 'react'
import WalletInterface from 'components/wallet/WalletInterface'
import { CircleSpinner } from 'components'

interface Props {
  setClaimStep: (any) => void
}

const ConnectWallet: React.FC<Props> = ({ setClaimStep }) => {
  const [connectingModal, setModalStatus] = useState<Boolean>(false)
  const onWalletConnected = useCallback(() => {
    setModalStatus(false)
    setClaimStep((c) => c + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const onWalletConnectFailed = useCallback(() => {
    setModalStatus(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const onWalletClickedToConnect = useCallback(() => {
    setModalStatus(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col md:flex-row flex-grow justify-between px-4 rounded-lg p-8 lg:p-16 md:pb-32 md:flex-row dark:bg-gray-500 items-center">
      <div className="text-4xl font-extrabold m-auto p-4 opacity-75 md:w-2/4">
        First, lets connect your wallet...
      </div>
      <div className="flex items-center justify-center h-full md:w-2/4">
        <WalletInterface
          onWalletConnected={onWalletConnected}
          onWalletConnectFailed={onWalletConnectFailed}
          onWalletClickedToConnect={onWalletClickedToConnect}
        />
      </div>

      {connectingModal && (
        <div className="fixed inset-x-1/2 w-max bottom-2 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:align-middle">
          <div className="bg-gray-50 px-4 py-3 sm:px-6 flex items-center">
            <div className="flex justify-center items-center mr-2">
              <CircleSpinner color="blue" />
            </div>
            Connecting Wallet
          </div>
        </div>
      )}
    </div>
  )
}

export default ConnectWallet
