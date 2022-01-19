import React, { useContext } from 'react'
import Image from 'next/image'

import DotGreen from '../../assets/dotgreen.svg'
import { useWeb3React } from '@web3-react/core'
import { GlobalContext } from 'lib/GlobalContext'

export default function WalletStatusWithConnectButton({
  openModal,
}: {
  openModal: () => void
}) {
  const { active, account } = useWeb3React()
  const { user, signedWalletAddress } = useContext(GlobalContext)
  const isSignedIn =
    active && signedWalletAddress?.signature && signedWalletAddress?.message

  return (
    <React.Fragment>
      <div
        className="flex flex-row items-center px-2 cursor-pointer justify-self-end"
        onClick={() => openModal()}
      >
        {!isSignedIn && (
          <div className="px-4 py-2 ml-2 text-sm text-white rounded-lg bg-brand-blue">
            {active ? 'Create Account' : 'Connect Wallet'}
          </div>
        )}

        {isSignedIn && <DotGreen className="w-4 h-4" />}
        {isSignedIn && (
          <div className="ml-3 text-gray-400 align-middle whitespace-nowrap hidden md:flex">
            {account.slice(0, 6)}...{account.slice(-4)}
          </div>
        )}
        {isSignedIn && (
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
        )}
      </div>
    </React.Fragment>
  )
}
