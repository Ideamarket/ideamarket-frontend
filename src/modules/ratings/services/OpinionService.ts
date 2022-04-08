import getLatestOpinionsAboutAddress from 'actions/web3/getLatestOpinionsAboutAddress'
import getOpinionsAboutAddress from 'actions/web3/getOpinionsAboutAddress'
import getUsersOpinions from 'actions/web3/getUsersOpinions'

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
 * Comments are optional, so not all opinions will have one.
 * This retrieves only the LATEST comments. No duplicates.
 */
export const getTotalNumberOfLatestComments = async (idtAddress: string) => {
  const opinions = await getLatestOpinionsAboutAddress(idtAddress)
  const opinionsWithComments = opinions.filter(
    (opinion) => opinion?.comment?.length > 0
  )
  return opinionsWithComments?.length
}

/**
 * Get users latest opinions (doesn't include duplicates from past)
 */
export const getUsersLatestOpinions = async (userAddress: string) => {
  if (!userAddress || userAddress?.length <= 0) return []
  const opinions = await getUsersOpinions(userAddress)
  // Loop opinions. Each iteration add to temp object using address as keys. This works in getting latest opinions because last opinion is always the latest
  const latestOpinions = {}
  opinions?.forEach((opinion) => {
    latestOpinions[opinion?.addy] = opinion
  })

  const finalResults = Object.values(latestOpinions)

  return finalResults
}
