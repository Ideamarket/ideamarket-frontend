import client from 'lib/axios'

/**
 * List a token onto the Ghost Market.
 * @param name -- name of token being listed in format that it is stored on blockchain
 * @param marketID -- id of market this token is being listed on. ID determined by data returned from subgraph
 */
export const listToken = async (name: string, marketId: number) => {
  await client.post(`/listing/ghost`, { value: name, marketId })
}
