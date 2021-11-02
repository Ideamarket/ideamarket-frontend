import { gql } from 'graphql-request'
import { ZERO_ADDRESS } from 'utils'

const ONE_WEEK_IN_UNIX_TIME = 604800

export default function getQueryTokens(
  marketIds: number[],
  skip: number,
  num: number,
  fromTs: number,
  orderBy: string,
  orderDirection: string,
  filterTokens: string[],
  isVerifiedFilter: boolean
): string {
  const hexMarketIds = marketIds.map((id) => '0x' + id.toString(16))
  let inMarkets = hexMarketIds.map((id) => `"${id}"`).join(',')

  let filterTokensQuery = ''
  if (filterTokens) {
    filterTokensQuery = 'id_in:['
    filterTokens.forEach((value, index) => {
      if (index > 0) {
        filterTokensQuery += ','
      }
      filterTokensQuery += `"${value}"`
    })
    filterTokensQuery += ']'
  }

  const marketsQuery = inMarkets ? `market_in:[${inMarkets}],` : ''
  const verifiedQuery = isVerifiedFilter
    ? `tokenOwner_not: "${ZERO_ADDRESS}",`
    : ''

  const queries =
    marketsQuery.length > 0 ||
    verifiedQuery.length > 0 ||
    filterTokensQuery.length > 0
      ? `where:{${marketsQuery}${verifiedQuery}${filterTokensQuery}},`
      : ''

  const currentTs = Math.floor(Date.now() / 1000)
  const weekBack = currentTs - ONE_WEEK_IN_UNIX_TIME

  return gql`
    {
      ideaTokens(${queries} skip:${skip}, first:${num}, orderBy:${orderBy}, orderDirection:${orderDirection}) {
          id
          tokenID
          name
          supply
          holders
          marketCap
          market {
            id: marketID
            name
          }
          rank
          tokenOwner
          daiInToken
          invested
          listedAt
          lockedAmount
          lockedPercentage
          latestPricePoint {
            timestamp
            counter
            oldPrice
            price
          }
          earliestPricePoint: pricePoints(first:1, orderBy:"timestamp", orderDirection:"asc", where:{timestamp_gt:"${fromTs}"}) {
            counter
            timestamp
            oldPrice
            price
          }
          dayVolume
          dayChange
          pricePoints(where:{timestamp_gt:${weekBack}} orderBy:timestamp) {
            oldPrice
            price
          }
        }
    }`
}
