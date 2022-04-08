import { useState, useEffect } from 'react'
import { useContractStore } from 'store/contractStore'
import { useWalletStore } from 'store/walletStore'
import {
  getAvgRatingForIDT,
  getTotalNumberOfLatestComments,
  getTotalNumberOfOpinions,
} from '../services/OpinionService'

/* Returns several data for opinions */
export default function useOpinionsByIDTAddress(
  idtAddress: string,
  refreshToggle?: boolean // Used to refresh supply whenever needed
) {
  const opinionBaseContract = useContractStore.getState().opinionBase

  const [isLoading, setIsLoading] = useState(true)
  const [avgRating, setAvgRating] = useState(0)
  const [totalOpinions, setTotalOpinions] = useState(0)
  const [totalComments, setTotalComments] = useState(0)

  const { web3, walletAddress, chainID } = useWalletStore((state) => ({
    web3: state.web3,
    walletAddress: state.address,
    chainID: state.chainID,
  }))

  useEffect(() => {
    let isCancelled = false

    async function run() {
      const avgRatingResult = await getAvgRatingForIDT(idtAddress)
      const totalOpinionsResult = await getTotalNumberOfOpinions(idtAddress)
      const totalCommentsResult = await getTotalNumberOfLatestComments(
        idtAddress
      )
      if (!isCancelled) {
        setAvgRating(avgRatingResult as any)
        setTotalOpinions(totalOpinionsResult)
        setTotalComments(totalCommentsResult)
        setIsLoading(false)
      }
    }

    setIsLoading(true)
    if (idtAddress && opinionBaseContract) run()

    return () => {
      isCancelled = true
    }
  }, [
    idtAddress,
    web3,
    refreshToggle,
    walletAddress,
    chainID,
    opinionBaseContract,
  ])

  return { avgRating, totalOpinions, totalComments, isLoading }
}
