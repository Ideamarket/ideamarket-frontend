import client from 'lib/axios'

/**
 * Trigger that will update DB with newest onchain posts/NFTs.
 */
export const syncPosts = async (tokenID: number) => {
  const body = {
    tokenID,
  }
  try {
    const response = await client.patch(`/post/sync`, body)
    return response?.data?.data
  } catch (error) {
    console.error(`Could not trigger NFT posts sync for ${tokenID}`, error)
    return null
  }
}
