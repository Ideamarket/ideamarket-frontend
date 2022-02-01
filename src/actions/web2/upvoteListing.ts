import client from 'lib/axios'

// TODO
/**
 * Web2 upvote a listing.
 * @param value -- value of token being listed in format that it is stored on blockchain
 * @param marketID -- id of market this token is being listed on. ID determined by data returned from subgraph
 * @param jwt (OPTIONAL) -- auth token for user
 */
export const upvoteListing = async (
  value: string,
  marketId: number,
  jwt: string
) => {
  const decodedValue = decodeURIComponent(value) // Decode so that no special characters are added to blockchain
  try {
    await client.post(
      `/listing/onchain`,
      { value: decodedValue, marketId },
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    )
  } catch (error) {
    console.error(`Could not upvote listing with listingID of ${value}`, error)
  }
}
