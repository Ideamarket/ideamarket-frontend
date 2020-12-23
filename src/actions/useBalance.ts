import { useState, useEffect } from 'react'
import { addresses, web3BNToFloatString } from '../utils'
import { useWalletStore } from 'store/walletStore'
import { getERC20Contract } from 'store/contractStore'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'

export default function useBalance(address: string, decimals: number) {
  const [isLoading, setIsLoading] = useState(true)
  const [balanceBN, setBalanceBN] = useState(undefined)
  const [balance, setBalance] = useState(undefined)

  const web3 = useWalletStore((state) => state.web3)

  useEffect(() => {
    let isCancelled = false

    function getBalance() {
      return new Promise<BN>((resolve) => {
        if (!web3 || !address) {
          resolve(new BN('0'))
          return
        }

        if (address === addresses.ZERO) {
          web3.eth
            .getBalance(useWalletStore.getState().address)
            .then((value) => {
              resolve(new BN(value))
            })
            .catch((error) => {
              console.log(error)
              resolve(new BN('0'))
            })
        } else {
          const contract = getERC20Contract(address)
          contract.methods
            .balanceOf(useWalletStore.getState().address)
            .call()
            .then((value) => {
              resolve(new BN(value))
            })
            .catch((error) => {
              console.log(error)
              resolve(new BN('0'))
            })
        }
      })
    }

    async function run() {
      const bn = await getBalance()
      if (!isCancelled) {
        const pow = new BigNumber('10').pow(new BigNumber(decimals))
        setBalanceBN(bn)
        setBalance(web3BNToFloatString(bn, pow, 4))
        setIsLoading(false)
      }
    }

    setIsLoading(true)
    run()

    return () => {
      isCancelled = true
    }
  }, [address, web3])

  return [isLoading, balanceBN, balance]
}
