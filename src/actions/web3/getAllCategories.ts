import { useContractStore } from 'store/contractStore'

/**
 * Get all categories that can be assigned to posts (defined in IdeamarketPosts contract)
 */
export default async function getAllCategories(): Promise<string[]> {
  const ideamarketPosts = useContractStore.getState().ideamarketPosts

  if (!ideamarketPosts) return null

  try {
    const activeCategories = await ideamarketPosts.methods
      .getActiveCategories()
      .call()

    return activeCategories
  } catch(error) {
    console.error('ideamarketPosts.methods.getActiveCategories() failed', error)
    return null
  }
}
