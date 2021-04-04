import { request } from 'graphql-request'
import { HTTP_GRAPHQL_ENDPOINT } from 'store/ideaMarketsStore'
import { getMarketSpecificsByMarketNameInURLRepresentation } from 'store/markets'
import { getQueryTokenForOGImage } from 'store/queries'
import { getHtml } from './template'
import { FileType } from './types'

export async function getOGImageHTML({
  rawMarketName,
  rawTokenName,
  fileType,
}: {
  rawMarketName: string
  rawTokenName: string
  fileType: FileType
}) {
  const marketSpecifics = getMarketSpecificsByMarketNameInURLRepresentation(
    rawMarketName
  )
  const result = await request(
    HTTP_GRAPHQL_ENDPOINT,
    getQueryTokenForOGImage(
      marketSpecifics.getMarketName(),
      marketSpecifics.getTokenNameFromURLRepresentation(rawTokenName)
    )
  )
  const token = result.ideaMarkets[0].tokens[0]
  // console.log(JSON.stringify(response, null, 2))
  let html
  if (token) {
    const weeklyPricePoints = token.pricePoints
    let weeklyChange = '0'
    if (weeklyPricePoints.length > 0) {
      const weeklyCurrentPrice = Number(
        weeklyPricePoints[weeklyPricePoints.length - 1].price
      )
      const weeklyOldPrice = Number(weeklyPricePoints[0].oldPrice)
      weeklyChange = Number(
        ((weeklyCurrentPrice - weeklyOldPrice) * 100) / weeklyOldPrice
      ).toFixed(2)
    }
    html = getHtml({
      rank: token.rank,
      username: rawTokenName,
      weeklyChange,
      price: Number(token.latestPricePoint.price).toFixed(2),
      fileType,
      market: marketSpecifics.getMarketNameURLRepresentation(),
    })
  } else {
    html = getHtml({
      rank: '0',
      username: rawTokenName,
      weeklyChange: '0',
      price: '0',
      fileType,
      market: marketSpecifics.getMarketNameURLRepresentation(),
    })
  }
  return html
}
