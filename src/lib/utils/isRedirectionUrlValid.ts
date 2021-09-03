import { getMarketSpecifics } from 'store/markets'

const IDEAMARKET_LISTING_URL_PREFIX = 'ideamarket.io/i/'

/**
 * Returns whether the redirection url is valid or not
 */
export function isRedirectionUrlValid(url: string): boolean {
  if (!url.startsWith(IDEAMARKET_LISTING_URL_PREFIX)) {
    return false
  }

  const suffix = url.split(IDEAMARKET_LISTING_URL_PREFIX).slice(1).join('')
  if (suffix.split('/').length !== 2) {
    return false
  }

  const [marketName, tokenName] = suffix.split('/')
  if (isMarketNameValid(marketName) && isTokenNameValid(tokenName)) {
    return true
  }

  return false
}

/**
 * Returns whether the market name is valid or not
 */
function isMarketNameValid(marketName: string) {
  const marketNames = getMarketSpecifics().map((market) =>
    market.getMarketNameURLRepresentation()
  )
  return marketNames.includes(marketName)
}

/**
 * Returns whether the token name is valid or not
 */
function isTokenNameValid(tokenName: string) {
  return true
}
