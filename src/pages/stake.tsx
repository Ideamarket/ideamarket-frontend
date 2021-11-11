import { DefaultLayout } from 'components/layouts'
import { NextSeo } from 'next-seo'
import StakeInner from 'components/stake/StakeInner'
import { ReactElement } from 'react'

const Stake = () => {
  return (
    <>
      <NextSeo title="Stake" />
      <div className="min-h-screen bg-top-desktop-new">
        <StakeInner />
      </div>
    </>
  )
}

export default Stake

Stake.getLayout = (page: ReactElement) => <DefaultLayout>{page}</DefaultLayout>
