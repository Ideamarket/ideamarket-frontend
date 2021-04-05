import { gql } from 'graphql-request'

export default function getQueryMarkets(marketNames: string[]): string {
  const inMarkets = marketNames.map((name) => `"${name}"`).join(',')
  const where =
    marketNames.length === 0 ? '' : `(where:{name_in:[${inMarkets}]})`
  return gql`
    {
      ideaMarkets${where} {
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
  `
}
