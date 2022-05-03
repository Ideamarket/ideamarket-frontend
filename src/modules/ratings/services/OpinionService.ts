import { getOpinionsByTokenID } from 'actions/web2/opinions/getOpinionsByTokenID'
import { getOpinionsByWallet } from 'actions/web2/opinions/getOpinionsByWallet'
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
  filterTokens,
  search,
}) => {
  if (!walletAddress || walletAddress?.length <= 0) return []
  const opinions = await getOpinionsByWallet({
    walletAddress,
    latest: true,
    skip,
    limit,
    orderBy,
    orderDirection,
    filterTokens,
    search,
  })

  return await Promise.all(
    opinions.map(async (opinion) => {
      return formatApiResponseToOpinion(opinion)
    })
  )
}

/**
 * Get latest opinions of this NFT
 */
export const getLatestOpinionsAboutNFTForTable = async ({
  tokenID,
  skip,
  limit,
  orderBy,
  orderDirection,
  filterTokens,
  search,
}) => {
  if (!tokenID) return []
  const opinions = await getOpinionsByTokenID({
    tokenID,
    latest: true,
    skip,
    limit,
    orderBy,
    orderDirection,
    filterTokens,
    search,
  })

  return await Promise.all(
    opinions.map(async (opinion) => {
      return formatApiResponseToOpinion(opinion)
    })
  )
}

export type IdeamarketOpinion = {
  contractAddress: string // Contract address the NFT is stored in
  tokenID: number // tokenID of this NFT
  minterAddress: string // Person that minted the NFT
  content: string
  categories: string[]
  imageLink: string
  isURL: boolean
  url: string
  blockHeight: number

  ratedBy: string
  ratedAt: string
  rating: number
  comment: string

  averageRating: number
  totalRatingsCount: number
  latestRatingsCount: number
  totalCommentsCount: number
  latestCommentsCount: number
}

/**
 * Format data fetched from API so that the format is consistent across entire frontend
 */
const formatApiResponseToOpinion = (apiPost: any): IdeamarketOpinion => {
  return {
    contractAddress: apiPost?.contractAddress,
    tokenID: apiPost?.tokenID,
    minterAddress: apiPost?.minterAddress,
    content: apiPost?.content,
    categories: apiPost?.categories,
    imageLink: apiPost?.imageLink,
    isURL: apiPost?.isURL,
    url: apiPost?.isURL ? apiPost?.content : '', // If there is a URL that was listed, it will be in content variable
    blockHeight: apiPost?.blockHeight,

    ratedBy: apiPost?.ratedBy,
    ratedAt: apiPost?.ratedAt,
    rating: apiPost?.rating,
    comment: apiPost?.comment,

    averageRating: apiPost?.averageRating,
    totalRatingsCount: apiPost?.totalRatingsCount,
    latestRatingsCount: apiPost?.latestRatingsCount,
    totalCommentsCount: apiPost?.totalCommentsCount,
    latestCommentsCount: apiPost?.latestCommentsCount,
  }
}
