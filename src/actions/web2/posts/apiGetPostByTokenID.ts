import client from 'lib/axios'

/**
 * Get post for this tokenID.
 * @param tokenID
 */
export const apiGetPostByTokenID = async ({ tokenID }) => {
  if (!tokenID) return []

  try {
    const params = {
      tokenID,
    }

    const response = await client.get(`/post/${tokenID}`, {
      params,
    })

    return response?.data?.data?.post
  } catch (error) {
    console.error(`Could not get post for this tokenID: ${tokenID}`, error)
    return null
  }
}
