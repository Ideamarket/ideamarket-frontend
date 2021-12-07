import { isServerSide } from 'utils'

export const DEFAULT_TITLE = 'The credibility layer of the internet'
export const DEFAULT_TITLE_TEMPLATE = 'Ideamarket | %s'
export const DEFAULT_DESCRIPTION =
  'Profit by discovering the world’s best information.'
export const DEFAULT_CANONICAL = 'https://ideamarket.io'
export const SITE_NAME = 'Ideamarket'
export const DEFAULT_OG_IMAGE = `${DEFAULT_CANONICAL}/og-image.jpg`
export const TWITTER_HANDLE = '@ideamarket_io'
export const TWITTER_CARD_TYPE = 'summary_large_image'
export const FAVICON_LINK = '/logo.png'

export const getURL = (): string => {
  const url = isServerSide()
    ? process.env.NODE_ENV === 'production'
      ? `https://${process.env.VERCEL_URL}`
      : `${process.env.VERCEL_URL}` ?? 'http://localhost:3000'
    : ''

  return url
}
