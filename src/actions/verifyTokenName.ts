import {
  getListingTypeFromIDTURL,
  LISTING_TYPE,
} from 'components/tokens/utils/ListingUtils'
import { getPostByContent } from 'modules/posts/services/PostService'

export default async function verifyTokenName(url: string) {
  if (!url || url === '')
    return {
      isValid: false,
      isAlreadyOnChain: false,
    }

  const existingListing = await getPostByContent({ content: url })

  const isAlreadyOnChain = Boolean(existingListing)

  // TODO: for now, only allowing tweets
  const isTweet = getListingTypeFromIDTURL(url) === LISTING_TYPE.TWEET

  // Is valid if not already on chain
  const isValid = isTweet && !isAlreadyOnChain

  return {
    isValid,
    isAlreadyOnChain,
  }
}
