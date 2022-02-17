import client from 'lib/axios'

/**
 * Get all categories defined on the backend. They can be assigned to listings.
 * @param enabled -- Get enabled (true), disabled (false), or all (null) categories
 */
export const getCategories = async ({ enabled }) => {
  try {
    const params = {
      enabled,
    }

    const response = await client.get(`/category`, {
      params,
    })

    return response?.data?.data?.categories
  } catch (error) {
    console.error('Could not get the categories from API', error)
  }
}
