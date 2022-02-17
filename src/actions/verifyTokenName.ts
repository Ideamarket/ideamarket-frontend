import { useContractStore } from 'store/contractStore'
import { querySingleToken } from 'store/ideaMarketsStore'
import { getMarketSpecificsByMarketName } from 'store/markets'

export default async function verifyTokenName(
  url: string,
  selectedMarket: any,
  isWalletConnected: boolean // Is there a user connected to a wallet?
) {
  if (!url || url === '' || !selectedMarket)
    return {
      isValid: false,
      isAlreadyGhostListed: false,
      isAlreadyOnChain: false,
      finalTokenValue: '',
    }

  // Final value that will be stored on chain as token's value
  const finalTokenValue = getMarketSpecificsByMarketName(
    selectedMarket.name
  ).convertUserInputToTokenName(url)

  let contractIsValid = true
  // Need to be connected to wallet to check contract validation. Skip it if not connnected to wallet so users can still type URLs
  if (isWalletConnected) {
    const factoryContract = useContractStore.getState().factoryContract
    contractIsValid = await factoryContract.methods
      .isValidTokenName(
        finalTokenValue || '',
        selectedMarket.marketID.toString()
      )
      .call()
  }

  // When fetching listing, backend always expects URL (not a token name from old market)
  const existingListing = await querySingleToken(
    url,
    finalTokenValue,
    selectedMarket.marketID
  )

  const ghostCategories = existingListing?.categories

  const isAlreadyGhostListed = Boolean(existingListing)
  const isAlreadyOnChain = existingListing?.isOnChain

  // Is valid if 1) canonical is not null 2) contract validation works 3) not already on chain 4) not already on ghost market
  const isValid = url && contractIsValid && !isAlreadyOnChain

  return {
    isValid,
    isAlreadyGhostListed,
    isAlreadyOnChain,
    finalTokenValue,
    ghostCategories,
  }
}
