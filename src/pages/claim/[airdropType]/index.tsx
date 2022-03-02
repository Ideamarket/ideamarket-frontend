import { createContext, ReactElement, useEffect, useState } from 'react'
import { NextSeo } from 'next-seo'

import ClaimInner from 'components/claim/ClaimInner'
import { BlankLayout } from 'components/layouts'
import FlowNavMenu from 'components/claim/flow-nav/NavMenu'
import { useRouter } from 'next/router'
import { AIRDROP_TYPES } from 'types/airdropTypes'

const STEPPER = {
  CLAIM: 'CLAIM',
  STAKE: 'STAKE',
}

export const AccountContext = createContext<any>({})

const Claim = () => {
  const router = useRouter()
  const { airdropType } = router.query
  const [stepper, setStepper] = useState(STEPPER.CLAIM)
  const contextProps = { stepper, setStepper }

  useEffect(() => {
    if (
      airdropType === AIRDROP_TYPES.USER ||
      airdropType === AIRDROP_TYPES.COMMUNITY ||
      airdropType === AIRDROP_TYPES.TWITTER_VERIFICATION ||
      airdropType === AIRDROP_TYPES.LOCKING
    )
      return
    router.push('/')
    // eslint-disable-next-line no-use-before-define
  }, [airdropType, router])

  return (
    <>
      <NextSeo title="Claim" />
      <AccountContext.Provider value={contextProps}>
        <div className="min-h-screen flex flex-col">
          <FlowNavMenu
            currentStep={-1}
            airdropType={airdropType as AIRDROP_TYPES}
          />
          <div className="bg-ideamarket-bg bg-no-repeat bg-ideamarket-bg bg-no-repeat bg-fixed background-position-mobile md:background-position-desktop flex flex-grow">
            <ClaimInner airdropType={airdropType as AIRDROP_TYPES} />
          </div>
        </div>
      </AccountContext.Provider>
    </>
  )
}

export default Claim

Claim.getLayout = (page: ReactElement) => <BlankLayout>{page}</BlankLayout>
