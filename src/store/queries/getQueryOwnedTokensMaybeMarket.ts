import { gql } from 'graphql-request'

export default function getQueryOwnedTokensMaybeMarket(owner: string): string {
  let where = `where:{holder:"${owner.toLowerCase()}", amount_gt:0}`

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
