import { gql } from 'graphql-request'

export default function getQueryMyTokensMaybeMarket(
  marketID: number,
  owner: string,
): string {
  let where

  if (marketID) {
    const hexMarketID = marketID ? '0x' + marketID.toString(16) : ''
    where = `where:{tokenOwner:"${owner.toLowerCase()}", market:"${hexMarketID}"}`
  } else {
    where = `where:{tokenOwner:"${owner.toLowerCase()}"}`
  }

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
        }
    }`
}
