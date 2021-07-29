import { DefaultLayout } from 'components'
import { NextSeo } from 'next-seo'
import { getURL } from 'utils/seo-constants'
import { GetServerSideProps } from 'next'

export default function TokenDetails({
  rawMarketName,
  rawTokenName,
}: {
  rawMarketName: string
  rawTokenName: string
}) {
  const token = null

  return (
    <>
      <NextSeo
        title="testing"
        openGraph={{
          images: [
            {
              url: `${
                process.env.NEXT_PUBLIC_OG_IMAGE_URL ?? getURL()
              }/api/${rawMarketName}/${rawTokenName}.png`,
            },
          ],
        }}
      />
      {token && (
        <div className="min-h-screen bg-brand-gray dark:bg-gray-900 pb-20"></div>
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      rawMarketName: context.query.marketName,
      rawTokenName: context.query.tokenName,
    },
  }
}

TokenDetails.layoutProps = {
  Layout: DefaultLayout,
}
