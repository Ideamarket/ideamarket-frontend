import { gql } from 'graphql-request'

export default function getQueryMarkets(marketNames: string[]): string {
  // TODO: remove once Wikipedia is needed
  const filteredMarketNames = marketNames.filter(name => name !== 'Wikipedia')
  const inMarkets = filteredMarketNames.map((name) => `"${name}"`).join(',')
  const where =
    filteredMarketNames.length === 0 ? '' : `(where:{name_in:[${inMarkets}]})`
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
