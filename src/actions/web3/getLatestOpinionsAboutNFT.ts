import { useContractStore } from 'store/contractStore'
import { NETWORK } from 'store/networks'

/**
 * Get latest ratings/opinions that are onchain (doesn't include past ratings from users, just most recent).
 * @param tokenId -- tokenId of NFT that has been rated
 */
export default async function getLatestOpinionsAboutNFT(
  tokenId: number
) {
  if (!tokenId) {
    console.error(`tokenId ${tokenId} is not valid`)
    return []
  }

  const nftOpinionBase = useContractStore.getState().nftOpinionBase
  const deployedAddresses = NETWORK.getDeployedAddresses()

  if (!nftOpinionBase || !deployedAddresses) {
    console.error(`nftOpinionBase or deployedAddresses not set correctly`)
    return []
  }

  try {
    return await nftOpinionBase.methods
      .getLatestOpinionsAboutNFT(deployedAddresses.ideamarketPosts, tokenId)
      .call()
  } catch (error) {
    console.error('nftOpinionBase.methods.getLatestOpinionsAboutNFT failed', error)
    return null
  }
}
