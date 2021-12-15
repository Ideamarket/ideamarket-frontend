import { createContext, ReactElement, useState } from 'react'
import { NextSeo } from 'next-seo'

import ClaimInner from 'components/claim/ClaimInner'
import { BlankLayout } from 'components/layouts'
import FlowNavMenu from 'components/claim/flow-nav/NavMenu'

const STEPPER = {
  CLAIM: 'CLAIM',
  STAKE: 'STAKE',
}

export const AccountContext = createContext<any>({})

const Claim = () => {
  const [stepper, setStepper] = useState(STEPPER.CLAIM)
  const contextProps = { stepper, setStepper }

  return (
    <>
      <NextSeo title="Claim" />
      <AccountContext.Provider value={contextProps}>
        <div className="min-h-screen flex flex-col">
          <FlowNavMenu currentStep={-1} />
          <div className="bg-ideamarket-bg bg-no-repeat bg-right flex flex-grow">
            <ClaimInner />
          </div>
        </div>
      </AccountContext.Provider>
    </>
  )
}

export default Claim

Claim.getLayout = (page: ReactElement) => <BlankLayout>{page}</BlankLayout>
