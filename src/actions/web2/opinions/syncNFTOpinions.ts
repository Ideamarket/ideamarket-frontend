import client from 'lib/axios'

/**
 * Trigger that will update DB with newest onchain NFT opinions.
 */
export const syncNFTOpinions = async (tokenID: number) => {
  const body = {
    tokenID,
  }
  try {
    const response = await client.patch(`/opinion/nft`, body)
    return response?.data?.data
  } catch (error) {
    console.error(`Could not trigger NFT opinion sync for ${tokenID}`, error)
    return null
  }
}
