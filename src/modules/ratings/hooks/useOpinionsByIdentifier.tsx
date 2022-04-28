import { useState, useEffect } from 'react'
import { useContractStore } from 'store/contractStore'
import { useWalletStore } from 'store/walletStore'
import {
  getAvgRatingForIDT,
  getAvgRatingForNFT,
  getLatestCommentsCountForIDT,
  getLatestCommentsCountForNFT,
  getLatestRatingsCountForIDT,
  getLatestRatingsCountForNFT,
} from '../services/OpinionService'

/* Returns several data for opinions. For NFTs, tokenId is used. For ERC20, idtAddress is used */
export default function useOpinionsByIdentifier({
  idtAddress,
  tokenId,
  refreshToggle = false, // Used to refresh supply whenever needed
}) {
  const addressOpinionBase = useContractStore.getState().addressOpinionBase
  const nftOpinionBase = useContractStore.getState().nftOpinionBase

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
      const avgRatingResult = idtAddress ? await getAvgRatingForIDT(idtAddress) : await getAvgRatingForNFT(tokenId)
      const totalOpinionsResult = idtAddress ? await getLatestRatingsCountForIDT(idtAddress) : await getLatestRatingsCountForNFT(tokenId)
      const totalCommentsResult = idtAddress ? await getLatestCommentsCountForIDT(idtAddress) : await getLatestCommentsCountForNFT(tokenId)
      if (!isCancelled) {
        setAvgRating(avgRatingResult as any)
        setTotalOpinions(totalOpinionsResult)
        setTotalComments(totalCommentsResult)
        setIsLoading(false)
      }
    }

    setIsLoading(true)
    if ((idtAddress || tokenId) && addressOpinionBase && nftOpinionBase) run()

    return () => {
      isCancelled = true
    }
  }, [idtAddress, tokenId, web3, refreshToggle, walletAddress, chainID, addressOpinionBase, nftOpinionBase])

  return { avgRating, totalOpinions, totalComments, isLoading }
}
