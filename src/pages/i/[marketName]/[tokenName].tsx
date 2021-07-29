import { DefaultLayout } from 'components'
import { NextSeo } from 'next-seo'
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
        title="test title"
        description="test description"
        openGraph={{
          type: 'website',
          url: `testurl`,
          title: 'default title',
          images: [
            {
              url: `${
                process.env.NEXT_PUBLIC_OG_IMAGE_URL
                  ? process.env.NEXT_PUBLIC_OG_IMAGE_URL
                  : 'https://og-image.ideamarket.io'
              }/api/twitter/elonmusk.png`,
              alt: 'twitter:image',
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
