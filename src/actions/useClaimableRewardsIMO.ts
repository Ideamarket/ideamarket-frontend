import BN from 'bn.js'
import { useEffect, useState } from 'react'
import { useContractStore } from 'store/contractStore'
import BigNumber from 'bignumber.js'
import { web3BNToFloatString } from 'utils'

export default function useClaimableRewardsIMO(user: string) {
  const [isLoading, setIsLoading] = useState(true)
  const [balanceBN, setBalanceBN] = useState(undefined)
  const [balance, setBalance] = useState(undefined)
  const sushiStaking = useContractStore.getState().sushiStakingContract

  useEffect(() => {
    let isCancelled = false
    const getBalance = async () => {
      return new Promise<BN>((resolve) => {
        sushiStaking.methods
          .pendingIMO(0, user)
          .call()
          .then((value) => {
            resolve(new BN(value))
          })
          .catch((error) => {
            console.error('Getting balance of ERC20 failed', error)
            resolve(new BN('0'))
          })
      })
    }

    async function run() {
      const bn = await getBalance()
      if (!isCancelled) {
        const pow = new BigNumber('10').pow(new BigNumber(2))
        setBalanceBN(bn)
        setBalance(web3BNToFloatString(bn, pow, 4, BigNumber.ROUND_DOWN))
        setIsLoading(false)
      }
    }

    setIsLoading(true)
    run()
    return () => {
      isCancelled = true
    }
  }, [user, sushiStaking])

  return [balance, balanceBN, isLoading]
}
