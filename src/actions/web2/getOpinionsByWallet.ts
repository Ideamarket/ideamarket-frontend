import client from 'lib/axios'

/**
 * Get opinions for this address with specified filters passed in.
 * Service methods on frontend will control which filters to use. This method simply passes all input to API in same format that it receives it
 * @param walletAddress
 */
export const getOpinionsByWallet = async ({
  walletAddress,
  latest,
  skip,
  limit,
  orderBy,
  orderDirection,
}) => {
  if (!walletAddress || walletAddress?.length <= 0) return []
  try {
    const params = {
      walletAddress: walletAddress.toLowerCase(),
      latest,
      skip,
      limit,
      orderBy,
      orderDirection,
    }

    const response = await client.get(`/opinion/wallet`, {
      params,
    })

    return response?.data?.data?.opinions
  } catch (error) {
    console.error(
      `Could not get opinions for this wallet: ${walletAddress}`,
      error
    )
    return null
  }
}
