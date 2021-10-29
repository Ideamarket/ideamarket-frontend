import { useState, useEffect } from 'react'
import { bigNumberTenPow18, web3BNToFloatString } from '../utils'
import { useWalletStore } from 'store/walletStore'
import { useContractStore } from 'store/contractStore'
import { ZERO_ADDRESS } from '../utils'
import { NETWORK } from 'store/networks'
import { IdeaToken, IdeaMarket } from '../store/ideaMarketsStore'

import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import { getInputForOutput, getOutputForInput } from 'utils/uniswap'

export default function useOutputAmount(
  ideaToken: IdeaToken,
  market: IdeaMarket,
  selectedTokenAddress: string,
  ideaTokenAmount: string,
  decimals: number,
  tradeType: string
) {
  const [isLoading, setIsLoading] = useState(true)
  const [outputBN, setOutputBN] = useState(undefined)
  const [output, setOutput] = useState(undefined)

  useEffect(() => {
    let isCancelled = false

    async function calculateBuyCost() {
      if (
        !useWalletStore.getState().web3 ||
        !selectedTokenAddress ||
        (!ideaToken && !market) ||
        parseFloat(ideaTokenAmount) <= 0.0
      ) {
        return new BN('0')
      }

      const ideaTokenAmountBN = new BN(
        new BigNumber(ideaTokenAmount).multipliedBy(bigNumberTenPow18).toFixed()
      )

      const exchangeContract = useContractStore.getState().exchangeContract

      let requiredDaiAmount
      if (!ideaToken) {
        // No ideaToken yet because it is being listed
        const factoryContract = useContractStore.getState().factoryContract
        const marketDetails = await factoryContract.methods
          .getMarketDetailsByID(market.marketID)
          .call()
        requiredDaiAmount = new BN(
          (
            await exchangeContract.methods
              .getCostsForBuyingTokens(
                marketDetails,
                new BN('0'),
                ideaTokenAmountBN,
                false
              )
              .call()
          ).total
        )
      } else {
        // How much DAI is required to buy this amount of Idea Tokens
        requiredDaiAmount = new BN(
          await exchangeContract.methods
            .getCostForBuyingTokens(ideaToken.address, ideaTokenAmountBN)
            .call()
        )
      }

      if (selectedTokenAddress === NETWORK.getExternalAddresses().dai) {
        return requiredDaiAmount
      }

      // Selected ERC20 token
      const inputTokenAddress =
        selectedTokenAddress === ZERO_ADDRESS
          ? NETWORK.getExternalAddresses().weth
          : selectedTokenAddress
      const outputTokenAddress = NETWORK.getExternalAddresses().dai

      try {
        // BUY: ERC20 -> WETH -> DAI (we want amount for ERC20)
        return await getInputForOutput(
          inputTokenAddress,
          outputTokenAddress,
          requiredDaiAmount
        )
      } catch (ex) {
        console.error('Exception during quote process for BUY:', ex)
        return new BN('0')
      }
    }

    async function calculateSellPrice() {
      const ideaTokenAmountBN = new BN(
        new BigNumber(ideaTokenAmount).multipliedBy(bigNumberTenPow18).toFixed()
      )

      if (
        !useWalletStore.getState().web3 ||
        !ideaToken ||
        !selectedTokenAddress ||
        parseFloat(ideaTokenAmount) <= 0.0
      ) {
        return new BN('0')
      }

      const exchangeContract = useContractStore.getState().exchangeContract
      let daiOutputAmount
      try {
        daiOutputAmount = new BN(
          await exchangeContract.methods
            .getPriceForSellingTokens(ideaToken.address, ideaTokenAmountBN)
            .call()
        )
      } catch (ex) {
        return new BN('0')
      }

      if (selectedTokenAddress === NETWORK.getExternalAddresses().dai) {
        return daiOutputAmount
      }

      const inputTokenAddress = NETWORK.getExternalAddresses().dai
      const outputTokenAddress =
        selectedTokenAddress === ZERO_ADDRESS
          ? NETWORK.getExternalAddresses().weth
          : selectedTokenAddress

      try {
        // SELL: DAI -> WETH -> ERC20 (we want amount for ERC20)
        return await getOutputForInput(
          inputTokenAddress,
          outputTokenAddress,
          daiOutputAmount
        )
      } catch (ex) {
        return new BN('0')
      }
    }

    async function run(fn) {
      if (!ideaTokenAmount || ideaTokenAmount === '') {
        setOutputBN(new BigNumber('0'))
        setOutput('0.0000')
        setIsLoading(false)
        return
      }

      const bn = await fn
      if (!isCancelled) {
        const pow = new BigNumber('10').pow(new BigNumber(decimals))
        setOutputBN(bn)
        setOutput(web3BNToFloatString(bn, pow, 8))
        setIsLoading(false)
      }
    }

    setIsLoading(true)
    if (tradeType === 'buy') {
      run(calculateBuyCost())
    } else {
      run(calculateSellPrice())
    }

    return () => {
      isCancelled = true
    }
  }, [
    ideaToken,
    selectedTokenAddress,
    ideaTokenAmount,
    tradeType,
    decimals,
    market,
  ])

  return [isLoading, outputBN, output]
}
