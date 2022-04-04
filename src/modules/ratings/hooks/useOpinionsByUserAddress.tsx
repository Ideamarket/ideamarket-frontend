import { useState, useEffect } from 'react'
import { useWalletStore } from 'store/walletStore'
import { getUsersLatestOpinions } from '../services/OpinionService'

/* Returns several data for opinions */
export default function useOpinionsByUserAddress(
  userAddress: string,
  refreshToggle?: boolean // Used to refresh supply whenever needed
) {
  const [isLoading, setIsLoading] = useState(true)
  const [latestUserOpinions, setLatestUserOpinions] = useState(0)

  const { web3, walletAddress, chainID } = useWalletStore((state) => ({
    web3: state.web3,
    walletAddress: state.address,
    chainID: state.chainID,
  }))

  useEffect(() => {
    let isCancelled = false

    async function run() {
      const latestUserOpinionsResult = await getUsersLatestOpinions(userAddress)
      if (!isCancelled) {
        setLatestUserOpinions(latestUserOpinionsResult as any)
        setIsLoading(false)
      }
    }

    setIsLoading(true)
    run()

    return () => {
      isCancelled = true
    }
  }, [userAddress, web3, refreshToggle, walletAddress, chainID])

  return { latestUserOpinions, isLoading }
}
