import { useEffect, useState } from 'react'
import { TokenAmount, Trade, TradeType } from '@uniswap/sdk'
import { IdeaMarket, IdeaToken } from 'store/ideaMarketsStore'
import { useWalletStore } from 'store/walletStore'
import {
  calculateIdeaTokensInputForDaiOutput,
  calculateMaxIdeaTokensBuyable,
  ZERO_ADDRESS,
  getUniswapPath,
  web3BNToFloatString,
} from 'utils'
import { NETWORK } from 'store/networks'

import BigNumber from 'bignumber.js'
import BN from 'bn.js'

const nullTokenBalance = new BN('0')

export default function useReversePrice(
  ideaToken: IdeaToken,
  market: IdeaMarket,
  tokenAddress: string,
  amount: string,
  decimals: number,
  tradeType: string,
  tokenBalanceBN = nullTokenBalance
) {
  const [isLoading, setIsLoading] = useState(true)
  const [outputBN, setOutputBN] = useState(undefined)
  const [output, setOutput] = useState(undefined)

  useEffect(() => {
    let isCancelled = false

    async function calculateBuyCost() {
      if (
        !useWalletStore.getState().web3 ||
        !tokenAddress ||
        (!ideaToken && !market) ||
        !tokenBalanceBN ||
        parseFloat(amount) <= 0.0
      ) {
        return new BN('0')
      }

      const amountBN = new BN(
        new BigNumber(amount)
          .multipliedBy(new BigNumber('10').exponentiatedBy(decimals))
          .toFixed(0, BigNumber.ROUND_DOWN)
      )

      let daiAmountBN = amountBN
      if (tokenAddress !== NETWORK.getExternalAddresses().dai) {
        const inputTokenAddress =
          tokenAddress === ZERO_ADDRESS
            ? NETWORK.getExternalAddresses().weth
            : tokenAddress
        const outputTokenAddress = NETWORK.getExternalAddresses().dai
        const path = await getUniswapPath(inputTokenAddress, outputTokenAddress)

        if (!path) {
          throw Error('No Uniswap path exists')
        }

        try {
          const trade = new Trade(
            path.route,
            new TokenAmount(path.inToken, amountBN.toString()),
            TradeType.EXACT_INPUT
          )

          daiAmountBN = new BN(
            new BigNumber(trade.outputAmount.toExact())
              .multipliedBy(new BigNumber('10').exponentiatedBy('18'))
              .toFixed(0, BigNumber.ROUND_DOWN)
          )
        } catch (ex) {
          return new BN('0')
        }
      }

      const requiredIdeaTokenAmount = new BN(
        calculateMaxIdeaTokensBuyable(
          daiAmountBN,
          ideaToken?.rawSupply || new BN('0'),
          market
        ).toFixed(0, BigNumber.ROUND_DOWN)
      )

      return requiredIdeaTokenAmount
    }

    async function calculateSellPrice() {
      const amountBN = new BN(
        new BigNumber(amount)
          .multipliedBy(
            new BigNumber('10').exponentiatedBy(decimals.toString())
          )
          .toFixed(0, BigNumber.ROUND_UP)
      )

      if (
        !useWalletStore.getState().web3 ||
        !ideaToken ||
        !tokenAddress ||
        amountBN.eq(new BN('0'))
      ) {
        return new BN('0')
      }

      let requiredDaiAmountBN = amountBN
      if (tokenAddress !== NETWORK.getExternalAddresses().dai) {
        // The user wants to receive a different currency than Dai
        // -> perform an Uniswap trade

        const inputTokenAddress = NETWORK.getExternalAddresses().dai
        const outputTokenAddress =
          tokenAddress === ZERO_ADDRESS
            ? NETWORK.getExternalAddresses().weth
            : tokenAddress

        const path = await getUniswapPath(inputTokenAddress, outputTokenAddress)

        if (!path) {
          throw Error('No Uniswap path exists')
        }

        try {
          const trade = new Trade(
            path.route,
            new TokenAmount(path.outToken, amountBN.toString()),
            TradeType.EXACT_OUTPUT
          )

          requiredDaiAmountBN = new BN(
            new BigNumber(trade.inputAmount.toExact())
              .multipliedBy(new BigNumber('10').exponentiatedBy('18'))
              .toFixed(0, BigNumber.ROUND_UP)
          )
        } catch (ex) {
          return new BN('0')
        }
      }

      const outputBN = new BN(
        calculateIdeaTokensInputForDaiOutput(
          requiredDaiAmountBN,
          ideaToken?.rawSupply || new BN('0'),
          market
        ).toFixed(0, BigNumber.ROUND_UP)
      )

      return outputBN
    }

    async function run(fn) {
      if (!amount || amount === '') {
        setOutputBN(new BN('0'))
        setOutput('0.0000')
        setIsLoading(false)
        return
      }

      const bn = await fn
      if (!isCancelled) {
        const pow = new BigNumber('10').pow(new BigNumber('18'))
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
    tokenAddress,
    amount,
    tradeType,
    tokenBalanceBN,
    decimals,
    market,
  ])

  return [isLoading, outputBN, output]
}
