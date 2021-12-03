import router from 'next/router'
import { useState, useCallback } from 'react'
import classNames from 'classnames'

import FlowNavMenu from './flow-nav/NavMenu'
// Claiming Flow Step Components
import ConnectWallet from './ConnectWallet'
import CheckEligibility from './CheckEligibility'
import ReceivedImo from './ReceivedImo'
import EligibilityOutcome from './EligibilityOutcome'

const ClaimInnerDashboard = () => {
  const [claimStep, setClaimStep] = useState(0)

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
          'min-h-screen pt-25',
          claimStep !== 3
            ? 'bg-ideamarket-bg bg-no-repeat bg-right bg-fixed'
            : ''
        )}
      >
        <div className="mx-auto font-inter w-90">
          <div className="flex p-4 flex-col md:flex-row">
            {claimStep !== 3 && (
              <button
                className="rounded-full bg-transparent font-bold py-2 px-3 border-2 border-brand-blue-2 h-12px w-12px m-auto ml-8 mt-12 md:ml-auto md:mt-auto bg-gradient-to-r bg-clip-text from-brand-blue-1 to-brand-blue-2 font-black text-transparent"
                onClick={onClickPrevious}
              >
                ←
              </button>
            )}
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
      </div>
    </>
  )
}

export default ClaimInnerDashboard
