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
  filterTokens,
  search,
}) => {
  if (!walletAddress || walletAddress?.length <= 0) return []
  // const categoriesString =
  //     categories && categories.length > 0 ? categories.join(',') : null
  const filterTokensString =
    filterTokens && filterTokens?.length > 0 ? filterTokens?.join(',') : null

  try {
    const params = {
      contractAddress: '0xe38409367699014145b7ADc41d7EbcD441370633',
      walletAddress: walletAddress.toLowerCase(),
      latest,
      skip,
      limit,
      orderBy,
      orderDirection,
      filterTokens: filterTokensString,
      search,
    }

    const response = await client.get(`/post/opinions/wallet`, {
      params,
    })

    return response?.data?.data?.postOpinions
  } catch (error) {
    console.error(
      `Could not get opinions for this wallet: ${walletAddress}`,
      error
    )
    return null
  }
}
