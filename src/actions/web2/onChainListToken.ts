import client from 'lib/axios'

/**
 * Do web2 portion of listing a token on chain.
 * @param value -- value of token being listed in format that it is stored on blockchain
 * @param marketID -- id of market this token is being listed on. ID determined by data returned from subgraph
 * @param jwt (OPTIONAL) -- auth token for user
 */
export const onChainListToken = async (
  value: string,
  url: string,
  marketId: number,
  jwt: string
) => {
  const decodedValue = decodeURIComponent(value)
  const decodedURL = decodeURIComponent(url)
  try {
    await client.post(
      `/listing/onchain`,
      { value: decodedURL, onchainValue: decodedValue, marketId },
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    )
  } catch (error) {
    console.error(
      `Could not do the web2 portion of listing ${value} on chain`,
      error
    )
  }
}
