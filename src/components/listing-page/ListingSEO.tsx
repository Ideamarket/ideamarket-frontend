import { NextSeo } from 'next-seo'
import { getURL } from 'utils/seo-constants'

export default function ListingSEO({ tokenName, rawTokenName }) {
  return (
    <NextSeo
      title={tokenName}
      canonical={`https://ideamarket.io/post/${rawTokenName}`}
      openGraph={{
        url: `https://ideamarket.io/post/${rawTokenName}`,
        images: [
          {
            url: `${
              process.env.NEXT_PUBLIC_OG_IMAGE_URL ?? getURL()
            }/api/${rawTokenName}.png`,
          },
        ],
      }}
    />
  )
}
