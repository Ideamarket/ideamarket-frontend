import { createContext, ReactElement } from 'react'
import { NextSeo } from 'next-seo'

import ClaimInnerDashboard from 'components/claim/ClaimInner-Dashboard'
import { BlankLayout } from 'components/layouts'

export const AccountContext = createContext<any>({})

const ClaimDashboard = () => {
  return (
    <>
      <NextSeo title="Claim-Dashboard" />
      <ClaimInnerDashboard />
    </>
  )
}

export default ClaimDashboard

ClaimDashboard.getLayout = (page: ReactElement) => (
  <BlankLayout>{page}</BlankLayout>
)
