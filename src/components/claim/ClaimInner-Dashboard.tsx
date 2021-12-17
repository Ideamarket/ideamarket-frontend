import router from 'next/router'
import { useState, useCallback, useEffect } from 'react'
import classNames from 'classnames'

import { FaArrowLeft } from 'react-icons/fa'
import FlowNavMenu from './flow-nav/NavMenu'
// Claiming Flow Step Components
import ConnectWallet from './ConnectWallet'
import CheckEligibility from './CheckEligibility'
import ReceivedImo from './ReceivedImo'
import EligibilityOutcome from './EligibilityOutcome'
import { useWalletStore } from 'store/walletStore'

const ClaimInnerDashboard = () => {
  const [claimStep, setClaimStep] = useState(0)

  const web3 = useWalletStore.getState().web3 as any

  const handleWeb3Change = () => {
    setClaimStep(0)
  }

  useEffect(() => {
    if (!web3) return

    if (web3.currentProvider.on !== undefined) {
      web3.currentProvider.on('chainChanged', handleWeb3Change)
      web3.currentProvider.on('accountsChanged', handleWeb3Change)
    }
    return () => {
      if (web3.currentProvider.off !== undefined) {
        web3.currentProvider.off('chainChanged', handleWeb3Change)
        web3.currentProvider.off('accountsChanged', handleWeb3Change)
      }
    }
  }, [web3])

  const onClickPrevious = useCallback(() => {
    if (claimStep === 0) {
      router.push('/claim')
    } else {
      setClaimStep((c) => c - 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claimStep])

  return (
    <>
      <FlowNavMenu currentStep={claimStep} />
      <div
        className={classNames(
          'min-h-screen flex items-start md:items-center',
          claimStep !== 3
            ? 'bg-ideamarket-bg bg-no-repeat bg-fixed background-position-mobile md:background-position-desktop'
            : ''
        )}
      >
        {claimStep !== 3 && (
          <button
            className="absolute left-12 top-36 md:top-28 lg:inset-y-1/2 rounded-full bg-transparent font-bold w-14 h-14 border-2 border-brand-blue-2 bg-gradient-to-r bg-clip-text from-brand-blue-1 to-brand-blue-2 font-black text-transparent"
            onClick={onClickPrevious}
          >
            <FaArrowLeft className="w-5 h-5 text-brand-blue-2 m-auto" />
          </button>
        )}
        <div
          className={classNames(
            'mx-auto font-inter w-full',
            claimStep === 3
              ? 'px-0 md:px-10 pt-40 md:pt-1 w-full'
              : 'pl-10 pr-10 lg:pl-32 lg:pr-24 pt-60 md:pt-1 lg:w-11/12'
          )}
        >
          {claimStep === 0 ? (
            <ConnectWallet setClaimStep={setClaimStep} />
          ) : claimStep === 1 ? (
            <CheckEligibility setClaimStep={setClaimStep} />
          ) : claimStep === 2 ? (
            <EligibilityOutcome setClaimStep={setClaimStep} />
          ) : (
            <ReceivedImo />
          )}
        </div>
      </div>
    </>
  )
}

export default ClaimInnerDashboard
