/**
 * Get the contract defined market for this URL
 */
export const getMarketFromURL = (url: string, markets: any[]) => {
  let marketName = 'URL'
  // TODO: when there is time, make this parsing more accurate. Tons of issues right now

  if (url.includes('twitter.com/')) {
    const afterDomain = url.substring(21, url.length)
    // If we see another slash, this means it is not Twitter account
    if (!afterDomain.includes('/')) {
      marketName = 'Twitter'
    }
  } else if (url.includes('wikipedia.org/wiki/')) {
    marketName = 'Wikipedia'
  } else if (url.includes('minds.com/')) {
    marketName = 'Minds'
  } else if (url.includes('tryshowtime.com/')) {
    marketName = 'Showtime'
  } else if (url.includes('.substack.com')) {
    marketName = 'Substack'
  }

  const urlMarket = markets?.find((m) => m.market.name === marketName)
  return urlMarket?.market
}
