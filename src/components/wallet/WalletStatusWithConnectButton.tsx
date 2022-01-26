import React, { useContext, useEffect, useState } from 'react'
import Image from 'next/image'

import { WalletGreenIcon } from '../../assets'
import { useWeb3React } from '@web3-react/core'
import { GlobalContext } from 'lib/GlobalContext'
import { ProfileTooltip } from './ProfileTooltip'
import { WalletTooltip } from './WalletTooltip'
import { useMixPanel } from 'utils/mixPanel'
import useAuth from 'components/account/useAuth'
import { useMutation } from 'react-query'

export default function WalletStatusWithConnectButton() {
  const { mixpanel } = useMixPanel()
  const { active, account, library } = useWeb3React()
  const { user } = useContext(GlobalContext)
  const [accountVisibility, setAccountVisibility] = useState<Boolean>(false)
  const [accountTimerId, setAccountTimerId] = useState(null)

  const [walletVisibility, setWalletVisibility] = useState<Boolean>(false)
  const [walletTimerId, setWalletTimerId] = useState(null)

  const onShowAccountOptions = () => {
    accountTimerId && clearTimeout(accountTimerId)
    if (active) {
      setAccountVisibility(true)
      setWalletVisibility(false)
    }
  }

  const onHideAccountOptions = () => {
    setAccountTimerId(
      setTimeout(() => {
        setAccountVisibility(false)
      }, 200)
    )
  }

  const onShowWalletOptions = () => {
    walletTimerId && clearTimeout(walletTimerId)
    setWalletVisibility(true)
    setAccountVisibility(false)
  }

  const onHideWalletOptions = () => {
    setWalletTimerId(
      setTimeout(() => {
        setWalletVisibility(false)
      }, 200)
    )
  }

  useEffect(() => {
    return () => {
      accountTimerId && clearTimeout(accountTimerId)
    }
  }, [accountTimerId])

  const [walletVerificationRequest] = useMutation<{
    message: string
    data: any
  }>(() =>
    fetch('/api/walletVerificationRequest', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(async (res) => {
      if (!res.ok) {
        const response = await res.json()
        throw new Error(response.message)
      }
      return res.json()
    })
  )
  const getSignedInWalletAddress = async () => {
    const { data } = await walletVerificationRequest()
    const uuid: string = data?.uuid
    const message: string = `
      Welcome to Ideamarket!

      Click to sign in and accept the Ideamarket Terms of Service: https://docs.ideamarket.io/legal/terms-of-service

      This request will not trigger a blockchain transaction or cost any gas fees.

      Your authentication status will reset after 30 days.

      Wallet address:
      ${account}

      UUID:
      ${uuid}
    `
    let signature: string = null

    if (message) {
      try {
        signature = await library?.eth?.personal?.sign(message, account, '')
      } catch (error) {
        console.log('metamask signin error', error)
      }
    }
    return message && signature
      ? {
          message,
          signature,
        }
      : null
  }

  const { loginByWallet } = useAuth()

  const onLoginClicked = async () => {
    mixpanel.track('ADD_ACCOUNT_START')

    if (active) {
      const signedWalletAddress = await getSignedInWalletAddress()
      await loginByWallet(signedWalletAddress)
    }
  }

  return (
    <div className="flex">
      <div className="flex flex-row items-center px-2 cursor-pointer justify-self-end">
        {!active && (
          <>
            <div
              className="px-4 py-2 ml-2 text-sm text-white rounded-lg bg-brand-blue"
              onClick={onShowWalletOptions}
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
            >
              <WalletGreenIcon className="w-6 h-6" />
              <div className="ml-3 text-gray-400 align-middle whitespace-nowrap hidden md:flex">
                {account.slice(0, 6)}...{account.slice(-4)}
              </div>
              {walletVisibility && (
                <div className="absolute top-0 mt-10 right-0 mb-1 text-sm rounded-xl shadow bg-white overflow-hidden">
                  <WalletTooltip openModal={onLoginClicked} />
                </div>
              )}
            </div>
            <div
              className="ml-3 w-6 h-6 relative rounded-full bg-gray-400"
              onMouseEnter={onShowAccountOptions}
              onMouseLeave={onHideAccountOptions}
            >
              {Boolean(user?.profilePhoto) && (
                <Image
                  src={user?.profilePhoto}
                  alt="Profile photo"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full"
                />
              )}
              {accountVisibility && (
                <div className="absolute top-0 mt-8 -right-5 mb-1 text-sm rounded-xl shadow bg-white overflow-hidden">
                  <ProfileTooltip onLoginClicked={onLoginClicked} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
