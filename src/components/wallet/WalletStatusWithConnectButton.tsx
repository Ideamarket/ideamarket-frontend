import React, { useContext } from 'react'
import Image from 'next/image'

import DotGreen from '../../assets/dotgreen.svg'
import { useWeb3React } from '@web3-react/core'
import { GlobalContext } from 'lib/GlobalContext'
import ModalService from 'components/modals/ModalService'
import WalletModal from './WalletModal'
import { useMixPanel } from 'utils/mixPanel'

export default function WalletStatusWithConnectButton() {
  const { mixpanel } = useMixPanel()
  const { active, account } = useWeb3React()
  const { user } = useContext(GlobalContext)

  const openWalletModal = () => {
    mixpanel.track('ADD_WALLET_START')
    ModalService.open(WalletModal)
  }

  return (
    <React.Fragment>
      <div
        className="flex flex-row items-center px-2 cursor-pointer justify-self-end"
        onClick={openWalletModal}
      >
        {!active && (
          <div className="px-4 py-2 ml-2 text-sm text-white rounded-lg bg-brand-blue">
            Connect Wallet
          </div>
        )}

        {active && (
          <>
            <DotGreen className="w-4 h-4" />
            <div className="ml-3 text-gray-400 align-middle whitespace-nowrap hidden md:flex">
              {account.slice(0, 6)}...{account.slice(-4)}
            </div>
            <div className="ml-3 w-6 h-6 relative rounded-full bg-gray-400">
              {Boolean(user?.profilePhoto) && (
                <Image
                  src={user?.profilePhoto}
                  alt="Profile photo"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full"
                />
              )}
            </div>
          </>
        )}
      </div>
    </React.Fragment>
  )
}
