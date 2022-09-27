import { useContractStore } from 'store/contractStore'
import { NETWORK } from 'store/networks'
import { useWalletStore } from 'store/walletStore'

/**
 * Does 3 things: 1) Create new text post 2) Cite newly created text post 3) Rate a post using citing from #2
 */
export default function postAndCite(
  content: string,
  rating: number,
  tokenId: number
) {
  if (!tokenId) {
    console.error(`tokenId ${tokenId} is not valid`)
    return null
  }

  const citationMultiAction = useContractStore.getState().citationMultiAction
  const deployedAddresses = NETWORK.getDeployedAddresses()

  if (!citationMultiAction || !deployedAddresses) {
    console.error(`citationMultiAction or deployedAddresses not set correctly`)
    return null
  }

  const connectedAddress = useWalletStore.getState().address

  console.log('content==', content)
  console.log('rating==', rating)
  console.log('connectedAddress==', connectedAddress)
  console.log('tokenId==', tokenId)

  const fee = '2000000000000000' // 0.001 ETH for posting and 0.001 ETH for rating

  try {
    // content, rating, recipient, tokenId
    return citationMultiAction.methods
      .postAndCite(
        content,
        rating,
        connectedAddress,
        tokenId
      )
      .send({ value: fee })
  } catch (error) {
    console.error('citationMultiAction.methods.postAndCite failed')
    return null
  }
}
