import { createContext, ReactElement, useEffect } from 'react'
import { NextSeo } from 'next-seo'

import ClaimInnerDashboard from 'components/claim/ClaimInner-Dashboard'
import { BlankLayout } from 'components/layouts'
import { useRouter } from 'next/router'
import { AIRDROP_TYPES } from 'types/airdropTypes'

export const AccountContext = createContext<any>({})

const ClaimDashboard = () => {
  const router = useRouter()
  const { airdropType } = router.query

  useEffect(() => {
    if (
      airdropType === AIRDROP_TYPES.USER ||
      airdropType === AIRDROP_TYPES.COMMUNITY ||
      airdropType === AIRDROP_TYPES.TWITTER_VERIFICATION
    )
      return
    router.push('/')
  }, [airdropType, AIRDROP_TYPES])
  return (
    <>
      <NextSeo title="Community-Claim-Dashboard" />
      <ClaimInnerDashboard airdropType={airdropType as AIRDROP_TYPES} />
    </>
  )
}

export default ClaimDashboard

ClaimDashboard.getLayout = (page: ReactElement) => (
  <BlankLayout>{page}</BlankLayout>
)
