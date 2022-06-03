import client from 'lib/axios'

/**
 * Get post by text in content variable.
 * @param content
 */
export const apiGetPostByContent = async ({ content }) => {
  if (!content) return []

  try {
    const params = {
      contractAddress: '0xe38409367699014145b7ADc41d7EbcD441370633',
      content,
    }

    const response = await client.get(`/post/single`, {
      params,
    })

    return response?.data?.data?.post
  } catch (error) {
    console.error(`Could not get post for this content: ${content}`, error)
    return null
  }
}
