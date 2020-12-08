import { useWalletStore } from 'store/walletStore'
import { useContractStore } from 'store/contractStore'
import { addresses } from '../utils'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import { IdeaMarket } from 'store/ideaMarketsStore'

export default function listAndBuyToken(
  tokenName: string,
  market: IdeaMarket,
  inputTokenAddress: string,
  amount: BN,
  cost: BN,
  slippage: number,
  lockDuration: number
) {
  const userAddress = useWalletStore.getState().address
  const multiAction = useContractStore.getState().multiActionContract

  const slippageAmount = new BN(
    new BigNumber(amount.toString())
      .multipliedBy(new BigNumber(slippage))
      .toFixed(0)
  )
  const fallbackAmount = amount.sub(slippageAmount)

  let contractCall
  let contractCallOptions = {}

  if (inputTokenAddress === addresses.dai) {
    contractCall = multiAction.methods.addAndBuy(
      tokenName,
      market.marketID,
      amount,
      lockDuration,
      userAddress
    )
  } else {
    contractCall = multiAction.methods.convertAddAndBuy(
      tokenName,
      market.marketID,
      inputTokenAddress,
      amount,
      fallbackAmount,
      cost,
      lockDuration,
      userAddress
    )

    if (inputTokenAddress === addresses.ZERO) {
      contractCallOptions = {
        value: cost,
      }
    }
  }

  return contractCall.send(contractCallOptions)
}
