import client from 'lib/axios'

/**
 * Get opinions for this token address with specified filters passed in.
 * Service methods on frontend will control which filters to use. This method simply passes all input to API in same format that it receives it
 * @param tokenAddress
 */
export const getOpinionsByIDT = async ({
  tokenAddress,
  latest,
  skip,
  limit,
  orderBy,
  orderDirection,
}) => {
  if (!tokenAddress || tokenAddress?.length <= 0) return []
  try {
    const params = {
      walletAddress: tokenAddress.toLowerCase(),
      latest,
      skip,
      limit,
      orderBy,
      orderDirection,
    }

    const response = await client.get(`/opinion/token`, {
      params,
    })

    return response?.data?.data?.opinions
  } catch (error) {
    console.error(
      `Could not get opinions for this token: ${tokenAddress}`,
      error
    )
    return null
  }
}
