import client from 'lib/axios'

/**
 * List a token onto the Ghost Market.
 * @param value -- value of token being listed in format that it is stored on blockchain
 * @param marketID -- id of market this token is being listed on. ID determined by data returned from subgraph
 */
export const ghostListToken = async (
  value: string,
  marketId: number,
  jwtToken: string
) => {
  const decodedValue = decodeURIComponent(value) // Decode so that no special characters are added to blockchain
  try {
    await client.post(
      `/listing/ghost`,
      { value: decodedValue, marketId },
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    )
  } catch (error) {
    console.error(`Could not list ${value} on the ghost market`, error)
  }
}
