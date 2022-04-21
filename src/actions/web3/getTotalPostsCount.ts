import { useContractStore } from 'store/contractStore'

/**
 * The total supply tells you how many IdeamarketPosts there are (how many URLs and text posts there are)
 */
export default async function getTotalPostsCount() {
  const ideamarketPosts = useContractStore.getState().ideamarketPosts
  return ideamarketPosts
    ? await ideamarketPosts.methods.totalSupply().call()
    : null
}
