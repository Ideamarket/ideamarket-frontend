import { getOpinionsByIDT } from 'actions/web2/getOpinionsByIDT'
import { getOpinionsByWallet } from 'actions/web2/getOpinionsByWallet'
import getLatestOpinionsAboutAddress from 'actions/web3/getLatestOpinionsAboutAddress'
import getLatestOpinionsAboutNFT from 'actions/web3/getLatestOpinionsAboutNFT'

/**
 * Get the average rating of all ratings onchain for this IDT
 */
export const getAvgRatingForIDT = async (idtAddress: string) => {
  const opinions = await getLatestOpinionsAboutAddress(idtAddress)
  const ratings = opinions.map((opinion) => Number(opinion.rating))
  if (!ratings || ratings?.length <= 0) return '⁠—'
  const average = (array) => array.reduce((a, b) => a + b) / array.length
  return average(ratings)
}

/**
 * Get the average rating of all ratings onchain for this NFT
 */
 export const getAvgRatingForNFT = async (tokenId: number) => {
  const opinions = await getLatestOpinionsAboutNFT(tokenId)
  const ratings = opinions.map((opinion) => Number(opinion.rating))
  if (!ratings || ratings?.length <= 0) return '⁠—'
  const average = (array) => array.reduce((a, b) => a + b) / array.length
  return average(ratings)
}

/**
 * Get total number of raters (total # opinions, not including duplicates by users)
 */
export const getLatestRatingsCountForIDT = async (idtAddress: string) => {
  const opinions = await getLatestOpinionsAboutAddress(idtAddress)
  return opinions?.length
}

/**
 * Get total number of raters (total # opinions, not including duplicates by users)
 */
export const getLatestRatingsCountForNFT = async (tokenId: number) => {
  const opinions = await getLatestOpinionsAboutNFT(tokenId)
  return opinions?.length
}

/**
 * Comments are optional, so not all opinions will have one.
 * This retrieves only the LATEST comments. No duplicates.
 */
export const getLatestCommentsCountForIDT = async (idtAddress: string) => {
  const opinions = await getLatestOpinionsAboutAddress(idtAddress)
  const opinionsWithComments = opinions.filter(
    (opinion) => opinion?.comment?.length > 0
  )
  return opinionsWithComments?.length
}

/**
 * Comments are optional, so not all opinions will have one.
 * This retrieves only the LATEST comments. No duplicates.
 */
export const getLatestCommentsCountForNFT = async (tokenId: number) => {
  const opinions = await getLatestOpinionsAboutNFT(tokenId)
  const opinionsWithComments = opinions.filter(
    (opinion) => opinion?.comment?.length > 0
  )
  return opinionsWithComments?.length
}

/**
 * Get users latest opinions (doesn't include duplicates from past)
 */
export const getUsersLatestOpinions = async ({
  walletAddress,
  skip,
  limit,
  orderBy,
  orderDirection,
}) => {
  if (!walletAddress || walletAddress?.length <= 0) return []
  const opinions = await getOpinionsByWallet({
    walletAddress,
    latest: true,
    skip,
    limit,
    orderBy,
    orderDirection,
  })

  return opinions
}

/**
 * Get latest opinions on this IDT (doesn't include duplicates from past)
 */
export const getIDTsLatestOpinions = async ({
  tokenAddress,
  skip,
  limit,
  orderBy,
  orderDirection,
}) => {
  if (!tokenAddress || tokenAddress?.length <= 0) return []
  const opinions = await getOpinionsByIDT({
    tokenAddress,
    latest: true,
    skip,
    limit,
    orderBy,
    orderDirection,
  })

  return opinions
}
