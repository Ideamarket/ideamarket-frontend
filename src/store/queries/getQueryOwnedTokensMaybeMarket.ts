import { gql } from 'graphql-request'

export default function getQueryOwnedTokensMaybeMarket(
  marketID: number,
  owner: string
): string {
  let where

  if (marketID) {
    const hexMarketID = marketID ? '0x' + marketID.toString(16) : ''
    where = `where:{holder:"${owner.toLowerCase()}", amount_gt:0, market:"${hexMarketID}"}`
  } else {
    where = `where:{holder:"${owner.toLowerCase()}", amount_gt:0}`
  }

  return gql`
    {
      ideaTokenBalances(${where}) {
        amount
        token {
          id
          tokenID
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
      }
    }`
}
