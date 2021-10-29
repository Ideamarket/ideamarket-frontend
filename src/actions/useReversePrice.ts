import { useEffect, useState } from 'react'
import { IdeaMarket, IdeaToken } from 'store/ideaMarketsStore'
import { useWalletStore } from 'store/walletStore'
import {
  calculateIdeaTokensInputForDaiOutput,
  calculateMaxIdeaTokensBuyable,
  ZERO_ADDRESS,
  web3BNToFloatString,
} from 'utils'
import { NETWORK } from 'store/networks'

import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import { getInputForOutput, getOutputForInput } from 'utils/uniswap'

const nullTokenBalance = new BN('0')

export default function useReversePrice(
  ideaToken: IdeaToken,
  market: IdeaMarket,
  selectedTokenAddress: string,
  selectedTokenAmount: string, // selected token amount
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
        !selectedTokenAddress ||
        (!ideaToken && !market) ||
        !tokenBalanceBN ||
        parseFloat(selectedTokenAmount) <= 0.0
      ) {
        return new BN('0')
      }

      const selectedTokenAmountBN = new BN(
        new BigNumber(selectedTokenAmount)
          .multipliedBy(new BigNumber('10').exponentiatedBy(decimals))
          .toFixed(0, BigNumber.ROUND_DOWN)
      )

      let daiAmountBN = selectedTokenAmountBN
      if (selectedTokenAddress !== NETWORK.getExternalAddresses().dai) {
        // Selected ERC20 token
        const inputTokenAddress =
          selectedTokenAddress === ZERO_ADDRESS
            ? NETWORK.getExternalAddresses().weth
            : selectedTokenAddress
        const outputTokenAddress = NETWORK.getExternalAddresses().dai

        try {
          // BUY: ERC20 -> WETH -> DAI (we want amount for DAI)
          daiAmountBN = await getOutputForInput(
            inputTokenAddress,
            outputTokenAddress,
            selectedTokenAmountBN
          )
        } catch (ex) {
          console.error('Exception during quote process for BUY:', ex)
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
      const selectedTokenAmountBN = new BN(
        new BigNumber(selectedTokenAmount)
          .multipliedBy(
            new BigNumber('10').exponentiatedBy(decimals.toString())
          )
          .toFixed(0, BigNumber.ROUND_UP)
      )

      if (
        !useWalletStore.getState().web3 ||
        !ideaToken ||
        !selectedTokenAddress ||
        parseFloat(selectedTokenAmount) <= 0.0
      ) {
        return new BN('0')
      }

      let requiredDaiAmountBN = selectedTokenAmountBN
      if (selectedTokenAddress !== NETWORK.getExternalAddresses().dai) {
        // The user wants to receive a different currency than Dai
        // -> perform a Uniswap trade

        const inputTokenAddress = NETWORK.getExternalAddresses().dai
        const outputTokenAddress =
          selectedTokenAddress === ZERO_ADDRESS
            ? NETWORK.getExternalAddresses().weth
            : selectedTokenAddress

        try {
          // SELL: DAI -> WETH -> ERC20 (we want amount for DAI)
          requiredDaiAmountBN = await getInputForOutput(
            inputTokenAddress,
            outputTokenAddress,
            selectedTokenAmountBN
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
      if (!selectedTokenAmount || selectedTokenAmount === '') {
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
    selectedTokenAddress,
    selectedTokenAmount,
    tradeType,
    tokenBalanceBN,
    decimals,
    market,
  ])

  return [isLoading, outputBN, output]
}
