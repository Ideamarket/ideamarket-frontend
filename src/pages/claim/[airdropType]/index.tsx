import { createContext, ReactElement, useEffect, useState } from 'react'
import { NextSeo } from 'next-seo'

import ClaimInner from 'components/claim/ClaimInner'
import { BlankLayout } from 'components/layouts'
import FlowNavMenu from 'components/claim/flow-nav/NavMenu'
import getSsrBaseUrl from 'utils/getSsrBaseUrl'
import { getData } from 'lib/utils/fetch'
import { GetServerSideProps } from 'next'
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
      airdropType === AIRDROP_TYPES.TWITTER_VERIFICATION
    )
      return
    router.push('/')
  }, [airdropType, AIRDROP_TYPES])

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

export const getServerSideProps: GetServerSideProps = async (context) => {
  // TODO: once feature switch is no longer needed for IMO, remove
  const baseUrl = getSsrBaseUrl(context.req)
  let imoFeature = { feature: 'IMO', enabled: false }
  try {
    const { data: imoResponse } = await getData({
      url: `${baseUrl}/api/fs?value=IMO`,
    })
    imoFeature = imoResponse
  } catch (error) {
    console.error('Failed to fetch api/fs for IMO')
  }

  if (!imoFeature.enabled) {
    return {
      redirect: {
        destination: '/404',
        permanent: false,
      },
    }
  }

  return {
    props: {},
  }
}

export default Claim

Claim.getLayout = (page: ReactElement) => <BlankLayout>{page}</BlankLayout>
