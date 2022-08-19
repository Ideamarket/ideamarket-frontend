import React, { useContext, useRef, useState } from 'react'
import Image from 'next/image'

import WalletGreenIcon from '../../assets/wallet-green.svg'
import { useWeb3React } from '@web3-react/core'
import { GlobalContext } from 'lib/GlobalContext'
import ModalService from 'components/modals/ModalService'
import WalletModal from './WalletModal'
import A from 'components/A'
import WalletIcon from '../../assets/wallet.svg'
import { ProfileTooltip } from 'components/nav-menu/ProfileTooltip'
import useOnClickOutside from 'utils/useOnClickOutside'
import ConnectWalletTooltip from 'components/nav-menu/ConnectWalletTooltip'

export default function WalletStatusWithConnectButton() {
  const { active, account } = useWeb3React()
  const { user } = useContext(GlobalContext)

  const [showProfileTooltip, setShowProfileTooltip] = useState(false)

  const ref = useRef()
  useOnClickOutside(ref, () => {
    setShowProfileTooltip(false)
  })

  const openWalletModal = () => {
    ModalService.open(WalletModal)
  }

  const [connectWalletVisibility, setConnectWalletVisibility] =
    useState<Boolean>(false)
  const [timerId, setTimerId] = useState(null)

  const onMouseLeaveConnectWallet = () => {
    setTimerId(
      setTimeout(() => {
        setConnectWalletVisibility(false)
      }, 200)
    )
  }

  const onMouseEnterConnectWallet = () => {
    timerId && clearTimeout(timerId)
    setConnectWalletVisibility(true)
  }

  const [profileTooltipVisibility, setProfileTooltipVisibility] =
    useState<Boolean>(false)

  const onMouseLeaveProfileTooltip = () => {
    setTimerId(
      setTimeout(() => {
        setProfileTooltipVisibility(false)
      }, 200)
    )
  }

  const onMouseEnterProfileTooltip = () => {
    timerId && clearTimeout(timerId)
    active && setProfileTooltipVisibility(true)
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden h-full md:flex flex-row items-center px-2 cursor-pointer justify-self-end">
        {!active && (
          <>
            {connectWalletVisibility && (
              <div className="fixed h-screen z-[300] inset-0 bg-gray-500 bg-opacity-75"></div>
            )}
            <div
              // onClick={openWalletModal}
              onMouseEnter={onMouseEnterConnectWallet}
              onMouseLeave={onMouseLeaveConnectWallet}
              className="relative h-full z-[500] flex justify-center items-center px-4 py-2 ml-2 text-xs font-bold text-white rounded-xl bg-brand-blue rounded-xl"
            >
              Connect Wallet
              {connectWalletVisibility && (
                <div className="absolute top-0 mt-12 right-0 mb-1 text-sm text-black overflow-hidden cursor-default">
                  <ConnectWalletTooltip />
                </div>
              )}
            </div>
          </>
        )}

        {active && (
          <div
            onMouseEnter={onMouseEnterProfileTooltip}
            onMouseLeave={onMouseLeaveProfileTooltip}
            className="flex items-center"
          >
            {profileTooltipVisibility && (
              <div className="absolute top-0 mt-10 right-0 mb-1 text-sm text-black rounded-xl shadow bg-white overflow-hidden">
                <ProfileTooltip />
              </div>
            )}
            <div
              onClick={openWalletModal}
              className="flex items-center border rounded-3xl px-3 py-2"
            >
              <WalletGreenIcon className="w-6 h-6" />
              <div className="ml-3 text-gray-400 align-middle whitespace-nowrap hidden md:flex">
                {account.slice(0, 6)}...{account.slice(-4)}
              </div>
            </div>

            <A
              href={
                active
                  ? `/u/${
                      user && user.username
                        ? user.username
                        : user?.walletAddress
                    }`
                  : '#'
              }
            >
              <button
                onClick={active ? null : openWalletModal}
                className="flex items-center space-x-2 h-9 bg-white/[.1] hover:text-blue-500 text-sm font-semibold py-1 ml-2 rounded-lg"
              >
                <span>My Profile</span>
                <div className="ml-3 w-8 h-8 relative rounded-full bg-gray-400">
                  <Image
                    src={user?.profilePhoto || '/default-profile-pic.png'}
                    alt="Profile photo"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-full"
                  />
                </div>
              </button>
            </A>
          </div>
        )}
      </div>

      {/* Mobile */}
      <div className="flex md:hidden">
        {!active && (
          <button
            onClick={openWalletModal}
            className="w-9 h-9 bg-gradient-to-br from-brand-blue-1 to-brand-blue-2 rounded-xl"
          >
            <WalletIcon className="stroke-current text-white w-6 h-full mx-auto" />
          </button>
        )}

        {active && (
          <>
            <div onClick={openWalletModal} className="flex items-center">
              {/* <WalletGreenIcon className="w-6 h-6" /> */}
              <div className="ml-3 text-gray-400 align-middle whitespace-nowrap hidden md:flex">
                {account.slice(0, 6)}...{account.slice(-4)}
              </div>
            </div>

            <div
              ref={ref}
              onClick={() => setShowProfileTooltip(!showProfileTooltip)}
              className="ml-3 w-8 h-8 relative rounded-full bg-gray-400"
            >
              <Image
                src={user?.profilePhoto || '/default-profile-pic.png'}
                alt="Profile photo"
                layout="fill"
                objectFit="cover"
                className="rounded-full"
              />

              {showProfileTooltip && (
                <div className="absolute top-0 mt-8 right-0 p-3 mb-1 text-sm rounded-xl shadow bg-white overflow-hidden">
                  <ProfileTooltip />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
