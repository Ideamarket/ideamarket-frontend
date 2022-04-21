import { useContractStore } from 'store/contractStore'

/**
 * Get all ratings/opinions that are onchain for this user.
 */
export default async function getUsersOpinions(userAddress: string) {
  if (!userAddress || userAddress?.length <= 0) return []
  const addressOpinionBase = useContractStore.getState().addressOpinionBase
  return await addressOpinionBase.methods.getUsersOpinions(userAddress).call()
}
