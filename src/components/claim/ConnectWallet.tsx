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
    <div className="flex flex-col md:flex-row items-center justify-between dark:bg-gray-500 rounded-lg">
      <div className="flex flex-col m-auto pr-0 md:pr-8 opacity-75 w-full md:w-1/2">
        <span className="text-4xl font-extrabold">
          First, lets connect your wallet...
        </span>
        <span className="font-normal text-sm w-full md:w-11/12 my-12 md:my-4">
          Kindly make sure that you connect with the wallet you've used to trade
          on Ideamarket.
        </span>
      </div>
      <div className="w-full md:w-1/2 my-8 md:my-8">
        <div className="ml-auto mr-auto md:mr-0 w-full md:w-80 md:min-2-80 lg:min-w-100">
          <span className="font-semibold text-sm pl-4 opacity-75">
            Choose the one you have from below...
          </span>
          <WalletInterface
            onWalletConnected={onWalletConnected}
            onWalletConnectFailed={onWalletConnectFailed}
            onWalletClickedToConnect={onWalletClickedToConnect}
          />
        </div>
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
