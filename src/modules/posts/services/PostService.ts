import apiGetAllPosts from 'actions/web2/posts/apiGetAllPosts'
import { apiGetPostByContent } from 'actions/web2/posts/apiGetPostByContent'
import { apiGetPostByTokenID } from 'actions/web2/posts/apiGetPostByTokenID'
import { IdeamarketUser } from 'modules/user-market/services/UserMarketService'
import { TIME_FILTER } from 'utils/tables'

/**
 * Get post data from backend and convert to one format for frontend
 */
export const getPostByTokenID = async ({
  tokenID,
}): Promise<IdeamarketPost> => {
  if (!tokenID) return null
  const post = await apiGetPostByTokenID({
    tokenID,
  })

  return post ? formatApiResponseToPost(post) : null
}

/**
 * Get post data from backend and convert to one format for frontend
 */
export const getPostByContent = async ({
  content,
}): Promise<IdeamarketPost> => {
  if (!content) return null
  const post = await apiGetPostByContent({
    content,
  })

  return post ? formatApiResponseToPost(post) : null
}

type Params = [
  limit: number,
  orderBy: string,
  orderDirection: string,
  categories: string[],
  filterTokens: string[],
  search: string,
  minterAddress: string,
  timeFilter: TIME_FILTER
]

/**
 * Call API to get all posts and then convert data to format consistent across entire frontend
 */
export async function getAllPosts(
  params: Params,
  skip = 0
): Promise<IdeamarketPost[]> {
  if (!params) {
    return []
  }

  const [
    limit,
    orderBy,
    orderDirection,
    categories,
    filterTokens,
    search,
    minterAddress,
    timeFilter,
  ] = params

  const allPosts = await apiGetAllPosts({
    skip,
    limit,
    orderBy,
    orderDirection,
    categories,
    filterTokens,
    search,
    minterAddress,
    timeFilter,
  })

  return await Promise.all(
    allPosts.map(async (post) => {
      return formatApiResponseToPost(post)
    })
  )
}

export type IdeamarketPost = {
  contractAddress: string // Contract address the NFT is stored in
  tokenID: number // tokenID of this NFT
  minterAddress: string // Person that minted the NFT
  content: string
  categories: string[]
  imageLink: string
  isURL: boolean
  url: string
  blockHeight: number

  minterToken: IdeamarketUser

  averageRating: number
  totalRatingsCount: number
  latestRatingsCount: number
  totalCommentsCount: number
  latestCommentsCount: number
  compositeRating: number
  marketInterest: number

  topCitations?: any[]
  topRatings?: any[]
}

/**
 * Format data fetched from API so that the format is consistent across entire frontend
 */
export const formatApiResponseToPost = (apiPost: any): IdeamarketPost => {
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

    minterToken: apiPost?.minterToken,

    averageRating: apiPost?.averageRating,
    totalRatingsCount: apiPost?.totalRatingsCount,
    latestRatingsCount: apiPost?.latestRatingsCount,
    totalCommentsCount: apiPost?.totalCommentsCount,
    latestCommentsCount: apiPost?.latestCommentsCount,
    compositeRating: apiPost?.compositeRating,
    marketInterest: apiPost?.marketInterest,

    topCitations: apiPost?.topCitations,
    topRatings: apiPost?.topRatings,
  }
}
