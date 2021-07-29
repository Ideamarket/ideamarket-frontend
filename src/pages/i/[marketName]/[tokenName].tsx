import { NextSeo } from 'next-seo'

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
                process.env.NEXT_PUBLIC_OG_IMAGE_URL ??
                'https://og-image.ideamarket.io'
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
