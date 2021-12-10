export default async function queryLambdavatar({
  rawMarketName,
  rawTokenName,
}: {
  rawMarketName: string
  rawTokenName: string
}): Promise<string> {
  try {
    const response = await fetch(
      `https://lambdavatar.backend.ideamarket.io/${rawMarketName}/${rawTokenName}`
    )
    const lambdavatar = await response.json()
    if (!lambdavatar.success) {
      return 'https://ideamarket.io/logo.png'
    }

    return lambdavatar.url
  } catch (error) {
    return 'https://ideamarket.io/logo.png'
  }
}
