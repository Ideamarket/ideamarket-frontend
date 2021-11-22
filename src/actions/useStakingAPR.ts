import { useState, useEffect } from 'react'
import { bnToFloatString, oneBigNumber, tenMillionBigNumber } from '../utils'
import { useWalletStore } from 'store/walletStore'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'

const calculatePercentChange = (a: number, b: number) =>
  100 * ((b - a) / Math.abs(a))

/* Gets the IMO APR */
export default function useStakingAPR(
  ratioImoAmount: BN,
  stakingContractIMOBalance: BN,
  xIMOTotalSupply: BN
) {
  const [isLoading, setIsLoading] = useState(true)
  const [apr, setAPR] = useState(undefined)

  const web3 = useWalletStore((state) => state.web3)

  useEffect(() => {
    let isCancelled = false

    const getApr = async () => {
      const xIMOTotalSupplyBigNumber = new BigNumber(
        xIMOTotalSupply ? xIMOTotalSupply.toString() : '0'
      )

      // If total xIMO supply is < 1, just show zero or else some crazy numbers are shown
      if (
        !web3 ||
        !xIMOTotalSupply ||
        xIMOTotalSupplyBigNumber.isLessThan(oneBigNumber)
      ) {
        return 0
      }

      try {
        // Need to use BigNumber.js for math because BN.js cannot deal with fractions
        const ratioImoAmountBigNumber = new BigNumber(ratioImoAmount.toString())
        const stakingContractIMOBalanceBigNumber = new BigNumber(
          stakingContractIMOBalance.toString()
        )
        const xIMOAmount = oneBigNumber.dividedBy(ratioImoAmountBigNumber) // This gives the xIMO amount that equals 1 IMO
        const payoutAfterYearBigNumber = xIMOAmount
          .multipliedBy(
            stakingContractIMOBalanceBigNumber.plus(tenMillionBigNumber)
          )
          .dividedBy(xIMOTotalSupplyBigNumber)
        const one = new BigNumber('1')
        const payoutAfterYear = parseFloat(
          bnToFloatString(payoutAfterYearBigNumber, one, 18)
        )
        return calculatePercentChange(1, payoutAfterYear)
      } catch (error) {
        return 0
      }
    }

    async function run() {
      const value = await getApr()
      if (!isCancelled) {
        setAPR(value)
        setIsLoading(false)
      }
    }

    setIsLoading(true)
    run()

    return () => {
      isCancelled = true
    }
  }, [ratioImoAmount, stakingContractIMOBalance, web3, xIMOTotalSupply])

  return [apr, isLoading]
}
