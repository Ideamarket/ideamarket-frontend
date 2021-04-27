export const DEFAULT_TITLE = 'Credibility without corporations'
export const DEFAULT_TITLE_TEMPLATE = 'Ideamarket | %s'
export const DEFAULT_DESCRIPTION =
  'Vote with your dollars, and give underrated voices the visibility they deserve.'
export const DEFAULT_CANONICAL = 'https://app.ideamarket.io'
export const SITE_NAME = 'Ideamarket'
export const DEFAULT_OG_IMAGE = `${DEFAULT_CANONICAL}/og-image.jpeg`
export const TWITTER_HANDLE = '@ideamarkets_'
export const TWITTER_CARD_TYPE = 'summary_large_image'
export const FAVICON_LINK = '/logo.png'

export const getURL = (): string => {
  const url =
    process?.env?.URL && process.env.URL !== ''
      ? process.env.URL
      : process?.env?.VERCEL_URL && process.env.VERCEL_URL !== ''
      ? process.env.VERCEL_URL
      : 'http://localhost:3000'
  return url.includes('http') ? url : `https://${url}`
}
