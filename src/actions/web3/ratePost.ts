import { useContractStore } from 'store/contractStore'
import { NETWORK } from 'store/networks'

/**
 * Rate a post (URL or text post) onchain.
 * https://github.com/Ideamarket/blockchain-of-opinions/blob/a741391dd5bc1689923fe2a2bd5a96e7fb8bd524/contracts/NFTOpinionBase.sol#L33
 * @param tokenId -- tokenId of NFT that is being rated
 * @param rating -- 0-100 inclusive, except 50
 */
export default function ratePost(
  tokenId: number,
  rating: number,
  comment: string
) {
  if (!tokenId) {
    console.error(`tokenId ${tokenId} is not valid`)
    return null
  }

  const nftOpinionBase = useContractStore.getState().nftOpinionBase
  const deployedAddresses = NETWORK.getDeployedAddresses()

  if (!nftOpinionBase || !deployedAddresses) {
    console.error(`nftOpinionBase or deployedAddresses not set correctly`)
    return null
  }

  try {
    return nftOpinionBase.methods
      .writeOpinion(deployedAddresses.ideamarketPosts, tokenId, rating, comment)
      .send()
  } catch (error) {
    console.error('nftOpinionBase.methods.writeOpinion failed')
    return null
  }
}
