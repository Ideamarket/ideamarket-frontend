import client from 'lib/axios'

/**
 * Get a single token (Ghost or onchain).
 * @param value -- the canonical URL (not a token name from old market)
 * @param marketID -- id of market this token is being listed on. ID determined by data returned from subgraph
 */
export const getSingleListing = async (value: string, marketId: number) => {
  const decodedValue = decodeURIComponent(value) // Decode so that special characters look normal
  try {
    const response = await client.get(`/listing/single`, {
      params: {
        marketId,
        value: decodedValue,
      },
    })

    return response?.data?.data
  } catch (error) {
    console.error('Could not get this single listing', error)
  }
}
