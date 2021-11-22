import { useState, useEffect } from 'react'
import { oneBigNumber, web3BNToFloatString } from '../utils'
import { useWalletStore } from 'store/walletStore'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import { getPendingIMO } from 'utils/imoStaking'

/* Gets the IMO payout amount based on amount of xIMO passed in */
export default function useIMOPayoutAmount(
  xIMOAmount: string,
  stakingContractIMOBalance: BN,
  xIMOTotalSupply: BN,
  dripSourceIMOBalanceBN: BN
) {
  const [isLoading, setIsLoading] = useState(true)
  const [imoPayoutBN, setIMOPayoutBN] = useState(undefined)
  const [imoPayout, setIMOPayout] = useState(undefined)

  const web3 = useWalletStore((state) => state.web3)

  useEffect(() => {
    let isCancelled = false

    const getIMOPayout = async () => {
      const xIMOTotalSupplyBigNumber = new BigNumber(
        xIMOTotalSupply ? xIMOTotalSupply.toString() : '0'
      )
      // If total xIMO supply is < 1, just show zero or else some crazy numbers are shown
      if (
        !web3 ||
        !xIMOTotalSupply ||
        xIMOTotalSupplyBigNumber.isLessThan(oneBigNumber)
      ) {
        return new BN('0')
      }

      try {
        const pendingIMOBigNumber = new BigNumber(
          (await getPendingIMO(dripSourceIMOBalanceBN)).toString()
        )
        const xIMOAmountBigNumber = new BigNumber(xIMOAmount).multipliedBy(
          new BigNumber('10').exponentiatedBy(18)
        )
        const stakingContractIMOBalanceBigNumber = new BigNumber(
          stakingContractIMOBalance.toString()
        )

        const imoPayoutBigNumber = xIMOAmountBigNumber
          .multipliedBy(
            stakingContractIMOBalanceBigNumber.plus(pendingIMOBigNumber)
          )
          .dividedBy(xIMOTotalSupplyBigNumber)
        return new BN(imoPayoutBigNumber.toFixed())
      } catch (error) {
        return new BN('0')
      }
    }

    async function run() {
      const bn = await getIMOPayout()
      if (!isCancelled) {
        const pow = new BigNumber('10').pow(new BigNumber(18))
        setIMOPayoutBN(bn)
        setIMOPayout(web3BNToFloatString(bn, pow, 4))
        setIsLoading(false)
      }
    }

    setIsLoading(true)
    run()

    return () => {
      isCancelled = true
    }
  }, [
    dripSourceIMOBalanceBN,
    stakingContractIMOBalance,
    web3,
    xIMOAmount,
    xIMOTotalSupply,
  ])

  return [imoPayout, imoPayoutBN, isLoading]
}
