import { NextSeo } from 'next-seo'
import { getURL } from 'next/dist/next-server/lib/utils'

export default function ListingSEO({ tokenName, rawMarketName, rawTokenName }) {
  return (
    <NextSeo
      title={tokenName}
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
  )
}
