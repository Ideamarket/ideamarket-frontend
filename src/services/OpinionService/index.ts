import getOpinionsAboutAddress from 'actions/web3/getOpinionsAboutAddress'

/**
 * Get the average rating of all ratings onchain for this IDT
 */
export const getAvgRatingForIDT = async (idtAddress: string) => {
  const opinions = await getOpinionsAboutAddress(idtAddress)
  const ratings = opinions.map((opinion) => Number(opinion.rating))
  const average = (array) => array.reduce((a, b) => a + b) / array.length
  return average(ratings)
}

export const getTotalNumberOfOpinions = async (idtAddress: string) => {
  const opinions = await getOpinionsAboutAddress(idtAddress)
  return opinions?.length
}
