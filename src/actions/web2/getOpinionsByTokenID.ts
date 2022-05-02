import client from 'lib/axios'

/**
 * Get opinions for this tokenID with specified filters passed in.
 * Service methods on frontend will control which filters to use. This method simply passes all input to API in same format that it receives it
 * @param tokenID
 */
export const getOpinionsByTokenID = async ({
  tokenID,
  latest,
  skip,
  limit,
  orderBy,
  orderDirection,
  filterTokens,
  search,
}) => {
  if (!tokenID) return []
  // const categoriesString =
  //     categories && categories.length > 0 ? categories.join(',') : null
  const filterTokensString =
    filterTokens && filterTokens?.length > 0 ? filterTokens?.join(',') : null

  try {
    const params = {
      tokenID,
      latest,
      skip,
      limit,
      orderBy,
      orderDirection,
      filterTokens: filterTokensString,
      search,
    }

    const response = await client.get(`/post/opinions/token`, {
      params,
    })

    return response?.data?.data?.postOpinions
  } catch (error) {
    console.error(`Could not get opinions for this tokenID: ${tokenID}`, error)
    return null
  }
}
