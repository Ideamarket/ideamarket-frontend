import { gql } from 'graphql-request'

const ONE_WEEK_IN_UNIX_TIME = 604800

export default function getQueryMyTokensMaybeMarket(
  marketID: number,
  owner: string
): string {
  let where

  if (marketID) {
    const hexMarketID = marketID ? '0x' + marketID.toString(16) : ''
    where = `where:{tokenOwner:"${owner.toLowerCase()}", market:"${hexMarketID}"}`
  } else {
    where = `where:{tokenOwner:"${owner.toLowerCase()}"}`
  }

  const currentTs = Math.floor(Date.now() / 1000)
  const weekBack = currentTs - ONE_WEEK_IN_UNIX_TIME

  return gql`
    {
      ideaTokens(${where}) {
          id
          tokenID
          market {
            marketID
            name
            baseCost
            priceRise
            hatchTokens
            tradingFeeRate
            platformFeeRate
            platformOwner
            platformFeeInvested
            nameVerifier
          }
          name
          supply
          holders
          marketCap
          tokenOwner
          daiInToken
          invested
          listedAt
          dayChange
          pricePoints(where:{timestamp_gt:${weekBack}} orderBy:timestamp) {
            oldPrice
            price
          }
        }
    }`
}
