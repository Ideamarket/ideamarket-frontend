import { useContractStore } from 'store/contractStore'

/**
 * Get all ratings/opinions that are onchain for this user.
 */
export default async function getUsersOpinions(userAddress: string) {
  if (!userAddress || userAddress?.length <= 0) return []
  const opinionBaseContract = useContractStore.getState().opinionBase
  return await opinionBaseContract.methods.getUsersOpinions(userAddress).call()
}
