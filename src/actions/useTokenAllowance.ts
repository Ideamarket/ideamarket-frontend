import { getTokenAllowance } from './'
import { useState, useEffect } from 'react'
import { useWalletStore } from 'store/walletStore'

export default function useTokenAllowance(
  tokenAddress: string,
  spenderAddress: string,
  updateOn?: any
) {
  const [isLoading, setIsLoading] = useState(true)
  const [allowance, setAllowance] = useState(undefined)

  const web3 = useWalletStore((state) => state.web3)

  useEffect(() => {
    let isCancelled = false

    async function run() {
      const bn = await getTokenAllowance(tokenAddress, spenderAddress)
      if (!isCancelled) {
        setAllowance(bn)
        setIsLoading(false)
      }
    }

    setIsLoading(true)
    run()

    return () => {
      isCancelled = true
    }
  }, [updateOn, web3, spenderAddress, tokenAddress])

  return [allowance, isLoading]
}
