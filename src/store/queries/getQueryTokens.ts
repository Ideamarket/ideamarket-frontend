import { gql } from 'graphql-request'

export default function getQueryTokens(
  marketIds: number[],
  skip: number,
  num: number,
  fromTs: number,
  orderBy: string,
  orderDirection: string,
  filterTokens: string[]
): string {
  const hexMarketIds = marketIds.map((id) => '0x' + id.toString(16))
  const inMarkets = hexMarketIds.map((id) => `"${id}"`).join(',')
  let filterTokensQuery = ''
  if (filterTokens) {
    filterTokensQuery = ',where:{id_in:['
    filterTokens.forEach((value, index) => {
      if (index > 0) {
        filterTokensQuery += ','
      }
      filterTokensQuery += `"${value}"`
    })
    filterTokensQuery += ']}'
  }

  return gql`
    {
      ideaTokens(where:{market_in:[${inMarkets}]}, skip:${skip}, first:${num}, orderBy:${orderBy}, orderDirection:${orderDirection}${filterTokensQuery}) {
          id
          tokenID
          name
          supply
          holders
          marketCap
          market {
            id: marketID
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
        }
    }`
}
