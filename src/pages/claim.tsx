import ClaimInner from 'components/claim/ClaimInner'
import { createContext, useState } from 'react'
import { DefaultLayout } from 'components/layouts'
import { NextSeo } from 'next-seo'

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
        <div className="min-h-screen bg-top-desktop-new">
          <ClaimInner />
        </div>
      </AccountContext.Provider>
    </>
  )
}

export default Claim

Claim.layoutProps = {
  Layout: DefaultLayout,
}
