import getLatestOpinionsAboutAddress from 'actions/web3/getLatestOpinionsAboutAddress'
import getOpinionsAboutAddress from 'actions/web3/getOpinionsAboutAddress'

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
 * Get total number of raters (total # opinions, not including duplicates by users)
 */
export const getTotalNumberOfOpinions = async (idtAddress: string) => {
  const opinions = await getLatestOpinionsAboutAddress(idtAddress)
  return opinions?.length
}

/**
 * Comments are optional, so not all opinions will have one
 */
export const getTotalNumberOfComments = async (idtAddress: string) => {
  const opinions = await getOpinionsAboutAddress(idtAddress)
  const opinionsWithComments = opinions.filter(
    (opinion) => opinion?.comment?.length > 0
  )
  return opinionsWithComments?.length
}
