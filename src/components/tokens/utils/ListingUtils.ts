/**
 * Defines different types of listings.
 * Needed this because market no longer enough. Ex: tweet listings on URL market, but so are any other URL
 * Currently this enum is only used on frontend.
 */
export enum LISTING_TYPE {
  TWITTER_PROFILE, // TODO: eventually there will be IM user market and it will be merged with Twitter market
  WIKI, // Ex: https://en.wikipedia.org/wiki/Optimism
  TWEET, // Ex: https://twitter.com/Shmojii/status/1506024575171280913
  GENERAL_URL, // Any URL that is not one of the above URL types
  TEXT_POST, // Text post stored on chain
}

/**
 * Get the enum LISTING_TYPE based on URL provided
 * @param idtURL -- URL that this listing links to
 */
export const getListingTypeFromIDTURL = (idtURL: string) => {
  if (!idtURL || idtURL?.length <= 0) return LISTING_TYPE.TEXT_POST
  const idtURLLowerCase = idtURL?.toLowerCase()
  const isWikipedia = idtURLLowerCase.includes('wikipedia.org')
  const isTwitter = idtURLLowerCase.includes('twitter.com')
  const isTweet = isTwitter && idtURLLowerCase.includes('status')

  if (isWikipedia) return LISTING_TYPE.WIKI
  if (isTweet) return LISTING_TYPE.TWEET
  // TODO: handle case when it is twitter URL, but not a tweet or a profile
  if (!isTweet && isTwitter) return LISTING_TYPE.TWITTER_PROFILE

  return LISTING_TYPE.GENERAL_URL
}
