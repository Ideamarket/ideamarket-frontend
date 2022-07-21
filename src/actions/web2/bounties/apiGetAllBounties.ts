import client from 'lib/axios'

/**
 * Get all bounties with sorting and filtering
 */
 export default async function apiGetAllBounties({
  skip,
  limit,
  orderBy,
  orderDirection,
  tokenID,
  userAddress,
  username,
  depositorUsername,
  depositorAddress,
  filterStatuses,
}) {
  try {
    const filterStatusesString =
      filterStatuses && filterStatuses?.length > 0 ? filterStatuses?.join(',') : null
    const response = await client.get(`/bounty`, {
      params: {
        skip,
        limit,
        orderBy,
        orderDirection,
        tokenID,
        userTokenId: null,
        userAddress,
        username,
        depositorTokenId: null,
        depositorUsername,
        depositorAddress,
        filterStatuses: filterStatusesString,
        startDate: null,
        endDate: null,
      },
    })

    return response?.data?.data
  } catch (error) {
    console.error('Could not get all bounties', error)
    return []
  }
}
