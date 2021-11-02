import { gql } from 'graphql-request'

const ONE_WEEK_IN_UNIX_TIME = 604800

export default function getQuerySingleToken(
  marketName: string,
  tokenName: string
): string {
  const currentTs = Math.floor(Date.now() / 1000)
  const weekBack = currentTs - ONE_WEEK_IN_UNIX_TIME

  return gql`
    {
      ideaMarkets(where:{name:${'"' + marketName + '"'}}) {
        tokens(where:{name:${'"' + tokenName + '"'}}) {
            id
            tokenID
            market {
              id
            }
            name
            supply
            holders
            marketCap
            tokenOwner
            daiInToken
            invested
            listedAt
            lockedAmount
            rank
            latestPricePoint {
              timestamp
              counter
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
      }
    }`
}
