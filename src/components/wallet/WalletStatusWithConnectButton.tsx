import React from 'react'
import Image from 'next/image'

import DotGreen from '../../assets/dotgreen.svg'
import { useWeb3React } from '@web3-react/core'

export default function WalletStatusWithConnectButton({
  openModal,
}: {
  openModal: () => void
}) {
  const { active, account } = useWeb3React()

  return (
    <React.Fragment>
      <div
        className="flex flex-row items-center px-2 cursor-pointer justify-self-end"
        onClick={() => openModal()}
      >
        {!active && (
          <div className="px-4 py-2 ml-2 text-sm text-white rounded-lg bg-brand-blue">
            Connect Wallet
          </div>
        )}

        {active && <DotGreen className="w-4 h-4" />}
        {active && (
          <div className="ml-3 text-gray-400 align-middle whitespace-nowrap hidden md:flex">
            {account.slice(0, 6)}...{account.slice(-4)}
          </div>
        )}
        {active && (
          <div className="ml-3 w-6 h-6 rounded-full relative rounded-full">
            <Image
              src="/avatar.png"
              alt="Workflow logo"
              layout="fill"
              objectFit="contain"
            />
          </div>
        )}
      </div>
    </React.Fragment>
  )
}
