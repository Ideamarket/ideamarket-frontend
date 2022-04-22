import { useContractStore } from 'store/contractStore'
import { NETWORK } from 'store/networks'

type Props = {
  content: string
  categoryTags: string[]
  imageLink: string
  isURL: boolean
  web2Content: string
}

/**
 * Mint a new post (URL or text post) onchain.
 * https://github.com/Ideamarket/blockchain-of-opinions/blob/a741391dd5bc1689923fe2a2bd5a96e7fb8bd524/contracts/IdeamarketPosts.sol#L38
 */
export default async function mintPost({
  content,
  categoryTags = [],
  imageLink,
  isURL,
  web2Content,
}: Props) {
  const ideamarketPosts = useContractStore.getState().ideamarketPosts
  const deployedAddresses = NETWORK.getDeployedAddresses()

  if (!ideamarketPosts || !deployedAddresses) {
    console.error(`ideamarketPosts or deployedAddresses not set correctly`)
    return null
  }

  try {
    return await ideamarketPosts.methods
      .mint(
        content,
        categoryTags,
        imageLink,
        isURL,
        web2Content,
        deployedAddresses.ideamarketPosts
      )
      .send()
  } catch (error) {
    console.error('ideamarketPosts.methods.mint failed')
    return null
  }
}
