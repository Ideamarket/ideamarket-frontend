import { useWalletStore } from 'store/walletStore'
import { useContractStore } from 'store/contractStore'
import { NETWORK } from 'store/networks'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'

export default function sellToken(
  ideaTokenAddress: string,
  outputTokenAddress: string,
  amount: BN,
  price: BN,
  slippage: number
) {
  const userAddress = useWalletStore.getState().address
  const exchange = useContractStore.getState().exchangeContract
  const multiAction = useContractStore.getState().multiActionContract

  const slippageAmount = new BN(
    new BigNumber(price.toString())
      .multipliedBy(new BigNumber(slippage))
      .toFixed(0)
  )
  const minPrice = price.sub(slippageAmount)

  let contractCall
  if (outputTokenAddress === NETWORK.getExternalAddresses().dai) {
    contractCall = exchange.methods.sellTokens(
      ideaTokenAddress,
      amount,
      minPrice,
      userAddress
    )
  } else {
    contractCall = multiAction.methods.sellAndConvert(
      outputTokenAddress,
      ideaTokenAddress,
      amount,
      minPrice,
      userAddress
    )
  }

  return contractCall.send()
}
