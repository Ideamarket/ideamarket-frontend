import { DefaultLayout } from 'components'
import { NextSeo } from 'next-seo'
import { getURL } from 'utils/seo-constants'

export default function TokenDetails() {
  const token = null
  return (
    <div>
      <NextSeo
        title="test"
        openGraph={{
          images: [
            {
              url: `${
                process.env.NEXT_PUBLIC_OG_IMAGE_URL ?? getURL()
              }/api/twitter/elonmusk.png`,
            },
          ],
        }}
      />
      {token && (
        <div className="min-h-screen bg-brand-gray dark:bg-gray-900 pb-20"></div>
      )}
    </div>
  )
}

TokenDetails.layoutProps = {
  Layout: DefaultLayout,
}
