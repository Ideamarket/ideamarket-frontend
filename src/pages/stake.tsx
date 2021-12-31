import { DefaultLayout } from 'components/layouts'
import { NextSeo } from 'next-seo'
import StakeInner from 'components/stake/StakeInner'
import { ReactElement } from 'react'
import { GetServerSideProps } from 'next'
import getSsrBaseUrl from 'utils/getSsrBaseUrl'
import { getData } from 'lib/utils/fetch'

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

export default Stake

Stake.getLayout = (page: ReactElement) => <DefaultLayout>{page}</DefaultLayout>
