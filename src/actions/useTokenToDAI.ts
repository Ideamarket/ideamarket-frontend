import { useState, useEffect } from 'react'
import { web3BNToFloatString } from '../utils'
import { useWalletStore } from 'store/walletStore'
import { TokenListEntry } from '../store/tokenListStore'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import { getExchangeRate } from 'utils/uniswap'

export default function useTokenToDAI(
  token: TokenListEntry,
  amount: string,
  decimals: number
) {
  const [isLoading, setIsLoading] = useState(true)
  const [outputBN, setOutputBN] = useState(undefined)
  const [output, setOutput] = useState(undefined)

  useEffect(() => {
    let isCancelled = false

    async function calculateTokenToDAI() {
      const amountBN = new BN(
        new BigNumber(amount)
          .multipliedBy(
            new BigNumber('10').exponentiatedBy(decimals.toString())
          )
          .toFixed()
      )

      if (
        !useWalletStore.getState().web3 ||
        !token ||
        !token.address ||
        !amount ||
        !amountBN ||
        !BN.isBN(amountBN) ||
        amountBN.lte(new BN('0'))
      ) {
        return new BN('0')
      }

      try {
        const exchangeRate = await getExchangeRate(token.address)
        // Caclulate the DAI worth of the input tokens by finding this product
        const product = parseFloat(amount) * parseFloat(exchangeRate)
        const productBN = new BN(
          new BigNumber(product)
            .multipliedBy(new BigNumber('10').exponentiatedBy(18))
            .toFixed()
        )
        return productBN
      } catch (ex) {
        return new BN('0')
      }
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
        setOutput(web3BNToFloatString(bn, pow, 4))
        setIsLoading(false)
      }
    }

    setIsLoading(true)
    run(calculateTokenToDAI())

    return () => {
      isCancelled = true
    }
  }, [token, token.address, amount, decimals])

  return [isLoading, outputBN, output]
}
