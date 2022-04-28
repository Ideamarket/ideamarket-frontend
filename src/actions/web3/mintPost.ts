import { useContractStore } from 'store/contractStore'
import { useWalletStore } from 'store/walletStore'

/**
 * Mint a new post (URL or text post) onchain.
 * https://github.com/Ideamarket/blockchain-of-opinions/blob/a741391dd5bc1689923fe2a2bd5a96e7fb8bd524/contracts/IdeamarketPosts.sol#L38
 */
export default function mintPost(
  content: string,
  categoryTags: string[],
  imageLink: string,
  isURL: boolean,
  urlContent: string,
) {
  const ideamarketPosts = useContractStore.getState().ideamarketPosts
  const connectedAddress = useWalletStore.getState().address

  if (!ideamarketPosts) {
    console.error(`ideamarketPosts not set correctly`)
    return null
  }

  try {
    return ideamarketPosts.methods
      .mint(
        content,
        categoryTags,
        imageLink,
        isURL,
        urlContent,
        connectedAddress
      )
      .send()
  } catch (error) {
    console.error('ideamarketPosts.methods.mint failed')
    return null
  }
}
