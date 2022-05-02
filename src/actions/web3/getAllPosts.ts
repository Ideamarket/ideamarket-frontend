import { useContractStore } from 'store/contractStore'
import getTotalPostsCount from './getTotalPostsCount'

/**
 * Get all posts (URLs and text posts)
 */
export default async function getAllPosts() {
  const ideamarketPosts = useContractStore.getState().ideamarketPosts

  if (!ideamarketPosts) return null

  const totalPostsCount = await getTotalPostsCount()

  // [1,2,3,...,<totalPostsCount>]
  const arrayOf1ToSupply = Array.from(
    { length: totalPostsCount },
    (_, i) => i + 1
  )

  try {
    const allPosts = Promise.all(
      arrayOf1ToSupply.map(async (tokenId) => {
        const ideamarketPost = await ideamarketPosts.methods
          .getPost(tokenId)
          .call()
        // Doing spread because contract returns an array of arrays
        return { ...ideamarketPost, tokenId }
      })
    )

    return allPosts
  } catch (error) {
    console.error('ideamarketPosts.methods.getPost(tokenId) failed')
    return null
  }
}
