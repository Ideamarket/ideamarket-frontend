import apiGetAllBounties from "actions/web2/bounties/apiGetAllBounties"


/**
 * Call API to get all bounties and then convert data to format consistent across entire frontend
 */
 export async function getAllBounties({
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
 }): Promise<any[]> {

  const allBounties = await apiGetAllBounties({
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
  })

  return await Promise.all(
    allBounties.map(async (bounty) => {
      return formatApiResponseToBounty(bounty)
    })
  )
}

export type Bounty = {
  contractAddress: string
  bountyIDs: number[]
  tokenID: number
  userToken: any
  userAddress: string
  depositorTokens: any[]
  depositorAddresses: string
  token: string
  post: any
  groupAmount: number
  groupFunders: number
  group: any
}

/**
 * Format data fetched from API so that the format is consistent across entire frontend
 */
export const formatApiResponseToBounty = (apiBounty: any): Bounty => {
  return {
    contractAddress: apiBounty?.contractAddress,
    bountyIDs: apiBounty?.bountyIDs,
    tokenID: apiBounty?.tokenID,
    userToken: apiBounty?.userToken,
    userAddress: apiBounty?.userAddress,
    depositorTokens: apiBounty?.depositorTokens,
    depositorAddresses: apiBounty?.depositorAddresses,
    token: apiBounty?.token,
    post: apiBounty?.post,
    groupAmount: apiBounty?.groupAmount,
    groupFunders: apiBounty?.groupFunders,
    group: apiBounty?.group,
  }
}
