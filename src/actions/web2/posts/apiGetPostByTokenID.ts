import client from 'lib/axios'

/**
 * Get post for this tokenID.
 * @param tokenID
 */
export const apiGetPostByTokenID = async ({ tokenID }) => {
  if (!tokenID) return []

  try {
    const params = {
      contractAddress: '0xe38409367699014145b7ADc41d7EbcD441370633',
      tokenID,
    }

    const response = await client.get(`/post/single`, {
      params,
    })

    return response?.data?.data?.post
  } catch (error) {
    console.error(`Could not get post for this tokenID: ${tokenID}`, error)
    return null
  }
}
