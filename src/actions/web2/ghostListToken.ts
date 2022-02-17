import ModalService from 'components/modals/ModalService'
import TradeCompleteModal, {
  TRANSACTION_TYPES,
} from 'components/trade/TradeCompleteModal'
import client from 'lib/axios'

/**
 * List a token onto the Ghost Market.
 * @param url -- normalized url of token
 * @param marketID -- id of market this token is being listed on. ID determined by data returned from subgraph
 * @param categories -- array of strings representing category IDs to add to this new onchain listing (OPTIONAL)
 */
export const ghostListToken = async (
  url: string,
  market: any,
  jwtToken: string,
  categories?: string[]
) => {
  const decodedValue = decodeURIComponent(url) // Decode so that no special characters are added to blockchain

  const categoriesString =
    categories && categories.length > 0 ? categories.join(',') : null

  const optionalParams = { categories: categoriesString }

  try {
    const response = await client.post(
      `/listing/ghost`,
      {
        value: decodedValue,
        marketId: market?.marketID,
        ...(categoriesString && optionalParams),
      }, // If there is categoryId, then include it as key to send to API
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    )
    return response
  } catch (error) {
    console.error(`Could not list ${url} on the ghost market`, error)
    ModalService.open(TradeCompleteModal, {
      isSuccess: false,
      tokenName: url,
      marketName: market?.name,
      transactionType: TRANSACTION_TYPES.NONE,
    })
    return null
  }
}
