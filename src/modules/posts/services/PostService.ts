import { apiGetPostByTokenID } from 'actions/web2/posts/apiGetPostByTokenID'

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

  return formatApiResponseToPost(post)
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

  averageRating: number
  totalRatingsCount: number
  latestRatingsCount: number
  totalCommentsCount: number
  latestCommentsCount: number
}

/**
 * Format data fetched from API so that the format is consistent across entire frontend
 */
const formatApiResponseToPost = (apiPost: any): IdeamarketPost => {
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

    averageRating: apiPost?.averageRating,
    totalRatingsCount: apiPost?.totalRatingsCount,
    latestRatingsCount: apiPost?.latestRatingsCount,
    totalCommentsCount: apiPost?.totalCommentsCount,
    latestCommentsCount: apiPost?.latestCommentsCount,
  }
}
