import React, { useContext, useEffect, useState } from 'react'
import Image from 'next/image'

import { WalletGreenIcon } from '../../assets'
import { useWeb3React } from '@web3-react/core'
import { GlobalContext } from 'lib/GlobalContext'
import { AccountOptionsInterface } from './AccountOptionsInterface'
import { WalletTooltip } from './WalletTooltip'
import ModalService from 'components/modals/ModalService'
import CreateAccountModal from 'components/account/CreateAccountModal'
import { BREAKPOINTS } from 'utils/constants'
import useBreakpoint from 'use-breakpoint'
import WalletModal from './WalletModal'
import AccountOptionsModal from './AccountOptionsModal'

export default function WalletStatusWithConnectButton() {
  const { active, account } = useWeb3React()
  const { user } = useContext(GlobalContext)
  const { breakpoint } = useBreakpoint(BREAKPOINTS, 'mobile')

  const [accountVisibility, setAccountVisibility] = useState<Boolean>(false)
  const [accountTimerId, setAccountTimerId] = useState(null)

  const [walletVisibility, setWalletVisibility] = useState<Boolean>(false)
  const [walletTimerId, setWalletTimerId] = useState(null)

  const isMobile = () => {
    if (breakpoint === 'mobile' || breakpoint === 'sm') return true
    return false
  }

  const openWalletModal = () => {
    ModalService.open(WalletModal)
  }
  const openProfileModal = () => {
    ModalService.open(AccountOptionsModal, { onLoginClicked })
  }

  const onShowAccountOptions = () => {
    if (isMobile()) return
    accountTimerId && clearTimeout(accountTimerId)
    if (active) {
      setAccountVisibility(true)
      setWalletVisibility(false)
    }
  }

  const onHideAccountOptions = () => {
    if (isMobile()) return
    setAccountTimerId(
      setTimeout(() => {
        setAccountVisibility(false)
      }, 200)
    )
  }

  const onShowWalletOptions = () => {
    if (isMobile()) return
    walletTimerId && clearTimeout(walletTimerId)
    setWalletVisibility(true)
    setAccountVisibility(false)
  }

  const onHideWalletOptions = () => {
    if (isMobile()) return
    setWalletTimerId(
      setTimeout(() => {
        setWalletVisibility(false)
      }, 200)
    )
  }

  const onToggleWalletOptions = () => {
    if (isMobile()) {
      openWalletModal()
      return
    }
    setWalletVisibility((c) => !c)
  }

  useEffect(() => {
    return () => {
      accountTimerId && clearTimeout(accountTimerId)
    }
  }, [accountTimerId])

  useEffect(() => {
    return () => {
      walletTimerId && clearTimeout(walletTimerId)
    }
  }, [walletTimerId])

  const onLoginClicked = async () => {
    ModalService.open(CreateAccountModal)
  }

  const onOpenWalletModal = () => {
    if (isMobile()) {
      openWalletModal()
      return
    }
  }

  const onOpenProfileModal = () => {
    if (isMobile()) {
      openProfileModal()
      return
    }
  }

  return (
    <div className="flex">
      <div className="flex flex-row items-center px-2 cursor-pointer justify-self-end">
        {!active && (
          <>
            <div
              className="px-4 py-2 ml-2 text-sm text-white rounded-lg bg-brand-blue"
              onClick={onToggleWalletOptions}
            >
              Connect Wallet
            </div>

            {walletVisibility && (
              <div className="absolute top-0 mt-10 right-0 mb-1 text-sm rounded-xl shadow bg-white overflow-hidden">
                <WalletTooltip openModal={onLoginClicked} />
              </div>
            )}
          </>
        )}

        {active && (
          <>
            <div
              className="flex"
              onMouseEnter={onShowWalletOptions}
              onMouseLeave={onHideWalletOptions}
              onClick={onOpenWalletModal}
            >
              <WalletGreenIcon className="w-6 h-6" />
              <div className="ml-3 text-gray-400 align-middle whitespace-nowrap hidden lg:flex">
                {account.slice(0, 6)}...{account.slice(-4)}
              </div>
              {walletVisibility && (
                <div className="absolute top-0 mt-10 right-0 mb-1 text-sm rounded-xl shadow bg-white overflow-hidden">
                  <WalletTooltip openModal={onLoginClicked} />
                </div>
              )}
            </div>
            <div
              className="ml-3 w-6 h-6 relative rounded-full"
              onMouseEnter={onShowAccountOptions}
              onMouseLeave={onHideAccountOptions}
              onClick={onOpenProfileModal}
            >
              <Image
                src={user?.profilePhoto || '/avatar.png'}
                alt="Profile photo"
                layout="fill"
                objectFit="cover"
                className="rounded-full"
              />
              {accountVisibility && (
                <div className="absolute top-0 mt-8 -right-5 mb-1 text-sm rounded-xl shadow bg-white overflow-hidden">
                  <AccountOptionsInterface onLoginClicked={onLoginClicked} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
