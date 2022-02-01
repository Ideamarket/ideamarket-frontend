import { useContractStore } from 'store/contractStore'
import { getMarketSpecificsByMarketName } from 'store/markets'
import { getSingleListing } from './web2/getSingleListing'
import { getValidURL } from './web2/getValidURL'

export default async function verifyTokenName(
  url: string,
  selectedMarket: any,
  isWalletConnected: boolean // Is there a user connected to a wallet?
) {
  const canonical = await getValidURL(url)

  // Final value that will be stored on chain as token's value
  const finalTokenValue = getMarketSpecificsByMarketName(
    selectedMarket.name
  ).convertUserInputToTokenName(canonical)

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
  const getExistingListing = await getSingleListing(
    canonical,
    selectedMarket.marketID
  )

  const isAlreadyGhostListed = getExistingListing?.web2TokenData
  const isAlreadyOnChain = getExistingListing?.web3TokenData

  // Is valid if 1) canonical is not null 2) contract validation works 3) not already on chain 4) not already on ghost market
  const isValid =
    canonical && contractIsValid && !isAlreadyOnChain && !isAlreadyGhostListed

  return {
    isValid,
    isAlreadyGhostListed,
    isAlreadyOnChain,
    finalTokenValue,
    canonical,
  }
}
