import { useContractStore } from 'store/contractStore'

/**
 * Get latest ratings/opinions that are onchain (doesn't include past ratings from users, just most recent).
 * @param idtAddress -- address of IDT that has been rated
 */
export default async function getLatestOpinionsAboutAddress(
  idtAddress: string
) {
  if (!idtAddress) return []
  const addressOpinionBase = useContractStore.getState().addressOpinionBase
  return await addressOpinionBase.methods
    .getLatestOpinionsAboutAddress(idtAddress)
    .call()
}
