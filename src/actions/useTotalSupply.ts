import { useState, useEffect } from 'react'
import { web3BNToFloatString } from '../utils'
import { useWalletStore } from 'store/walletStore'
import { getERC20Contract } from 'store/contractStore'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'

/* Gets the total supply of ERC20 token */
export default function useTotalSupply(
  tokenAddress: string,
  decimals: number,
  refreshToggle?: boolean // Used to refresh supply whenever needed
) {
  const [isLoading, setIsLoading] = useState(true)
  const [supplyBN, setSupplyBN] = useState(undefined)
  const [supply, setSupply] = useState(undefined)

  const web3 = useWalletStore((state) => state.web3)

  useEffect(() => {
    let isCancelled = false

    function getSupply() {
      return new Promise<BN>((resolve) => {
        if (!web3 || !tokenAddress) {
          resolve(new BN('0'))
          return
        }

        try {
          const contract = getERC20Contract(tokenAddress)
          contract.methods
            .totalSupply()
            .call()
            .then((value) => {
              resolve(new BN(value))
            })
            .catch((error) => {
              console.log(error)
              resolve(new BN('0'))
            })
        } catch (error) {
          resolve(new BN('0'))
        }
      })
    }

    async function run() {
      const bn = await getSupply()
      if (!isCancelled) {
        const pow = new BigNumber('10').pow(new BigNumber(decimals))
        setSupplyBN(bn)
        setSupply(web3BNToFloatString(bn, pow, 18, BigNumber.ROUND_DOWN))
        setIsLoading(false)
      }
    }

    setIsLoading(true)
    run()

    return () => {
      isCancelled = true
    }
  }, [tokenAddress, web3, refreshToggle, decimals])

  return [supply, supplyBN, isLoading]
}
