import { request } from 'graphql-request'
import { getMarketSpecificsByMarketNameInURLRepresentation } from 'store/markets'
import getQueryTokenForOGImage from './getQueryTokenForOGImage'
import { getHtml } from './template'
import { FileType } from './types'

const NETWORK = process.env.NEXT_PUBLIC_NETWORK
  ? process.env.NEXT_PUBLIC_NETWORK
  : 'rinkeby'

const HTTP_GRAPHQL_ENDPOINT =
  NETWORK === 'rinkeby'
    ? 'https://subgraph-rinkeby.backend.ideamarket.io/subgraphs/name/Ideamarket/IdeamarketRINKEBY'
    : NETWORK === 'test'
    ? 'https://subgraph-test.backend.ideamarket.io/subgraphs/name/Ideamarket/IdeamarketTEST'
    : 'https://subgraph.backend.ideamarket.io/subgraphs/name/Ideamarket/Ideamarket'

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
