import client from 'lib/axios'
import { isURL } from 'services/URLService'

/**
 * Get the meta data of URL
 * @param url -- url associated with an ideaToken
 */
export const getURLMetaData = async (url: string) => {
  if (!isURL(url)) return null
  const response = await client.post(`/general/url-metadata`, {
    url,
  })
  return response?.data?.data
}
