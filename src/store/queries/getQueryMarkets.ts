import { gql } from 'graphql-request'
import { getURL } from 'utils/seo-constants'

export default async function getQueryMarkets(
  marketNames: string[]
): Promise<string> {
  // Tried using getData util method, but somehow its url prop is buggy
  const { data: mindsFeature } = await (
    await fetch(`${getURL()}/api/fs?value=MINDS`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  ).json()
  const { data: wikiFeature } = await (
    await fetch(`${getURL()}/api/fs?value=WIKIPEDIA`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  ).json()

  // TODO: once feature switch is no longer needed for Minds and Wiki, comment these out until next market launch
  let filteredMarkets = marketNames.filter((market) => market !== 'All')
  filteredMarkets = mindsFeature.enabled
    ? filteredMarkets
    : filteredMarkets.filter((market) => market !== 'Minds')
  filteredMarkets = wikiFeature.enabled
    ? filteredMarkets
    : filteredMarkets.filter((market) => market !== 'Wikipedia')
  const notInList = []
  if (!mindsFeature.enabled) notInList.push('Minds')
  if (!wikiFeature.enabled) notInList.push('Wikipedia')

  const inMarkets = filteredMarkets.map((name) => `"${name}"`).join(',')
  const outMarkets =
    notInList.length > 0 ? notInList.map((name) => `"${name}"`).join(',') : `""`
  // Need to use outMarkets because empty query will fetch all markets, despite feature switches
  const where =
    marketNames.length === 0
      ? `(where:{name_not_in:[${outMarkets}]})`
      : `(where:{name_in:[${inMarkets}]})`
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
