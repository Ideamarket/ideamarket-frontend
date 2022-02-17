import client from 'lib/axios'

/**
 * Get all listings
 * if marketType === 'onchain', then only gets web3TokenData
 * if marketType === 'ghost', then only gets web2TokenData
 * if marketType === null, then gets both web2TokenData and web3TokenData
 */
export const getAllListings = async ({
  marketType = '',
  marketIds,
  skip,
  limit,
  orderBy,
  orderDirection,
  filterTokens,
  earliestPricePointTs,
  search,
  isVerifiedFilter,
  jwt,
  categories, // array of strings representing category IDs to add to this new onchain listing (OPTIONAL)
}) => {
  const categoriesString =
    categories && categories.length > 0 ? categories.join(',') : null
  const filterTokensString =
    filterTokens && filterTokens?.length > 0 ? filterTokens?.join(',') : null
  const response = await client.get(`/listing`, {
    params: {
      marketType,
      marketIds,
      skip,
      limit,
      orderBy,
      orderDirection,
      filterTokens: filterTokensString,
      earliestPricePointTs,
      search,
      verified: isVerifiedFilter,
      categories: categoriesString,
    },
    headers: {
      Authorization: jwt ? `Bearer ${jwt}` : null,
    },
  })

  return response?.data?.data?.listings
}
