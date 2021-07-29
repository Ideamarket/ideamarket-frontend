import { NextSeo } from 'next-seo'

export default function test() {
  return (
    <div>
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
      testing this
    </div>
  )
}
