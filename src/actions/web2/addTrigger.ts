import client from 'lib/axios'

/**
 * Add trigger that will update DB with new onchain listing.
 * @param tokenId -- tokenId that is stored on blockchain
 * @param marketID -- id of market this token is being listed on. ID determined by data returned from subgraph
 * @param categories -- array of strings representing category IDs to add to this new onchain listing (OPTIONAL)
 *
 * @return {
 *   type: "ONCHAIN_LISTING",
 *   triggerData: {
 *     marketID: 1,
 *     tokenId: 1,
 *     categories: "620d34d8990df52eee7b33ee,620d34d8990df52eee7b33ee",
 *   }
 * }
 */
export const addTrigger = async (
  tokenId: number,
  marketId: number,
  categories?: string[]
) => {
  const categoriesString =
    categories && categories.length > 0 ? categories.join(',') : null
  const optionalParams = { categories: categoriesString }
  const body = {
    type: 'ONCHAIN_LISTING',
    triggerData: {
      marketId,
      tokenId,
      ...(categoriesString && optionalParams),
    },
  }
  try {
    const response = await client.post(`/trigger`, body)
    return response?.data?.data?.trigger
  } catch (error) {
    console.error(`Could not add trigger for ${tokenId}`, error)
  }
}
