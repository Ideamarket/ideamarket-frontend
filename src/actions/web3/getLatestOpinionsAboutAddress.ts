import { useContractStore } from 'store/contractStore'

/**
 * Get latest ratings/opinions that are onchain (doesn't include past ratings from users, just most recent).
 * @param idtAddress -- address of IDT that has been rated
 */
export default async function getLatestOpinionsAboutAddress(
  idtAddress: string
) {
  if (!idtAddress) return []
  const opinionBaseContract = useContractStore.getState().opinionBase
  return await opinionBaseContract.methods
    .getLatestOpinionsAboutAddress(idtAddress)
    .call()
}
