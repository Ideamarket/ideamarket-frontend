import MindsMarketSpecifics from 'store/markets/minds'
import ShowtimeMarketSpecifics from 'store/markets/showtime'
import SubstackMarketSpecifics from 'store/markets/substack'
import TwitchMarketSpecifics from 'store/markets/twitch'
import TwitterMarketSpecifics from 'store/markets/twitter'
import WikipediaMarketSpecifics from 'store/markets/wikipedia'
import { mindsValidator } from './mindsValidator'
import { wikipediaValidator } from './wikipediaValidator'

const twitterMarketSpecifics = new TwitterMarketSpecifics()
const substackMarketSpecifics = new SubstackMarketSpecifics()
const showtimeMarketSpecifics = new ShowtimeMarketSpecifics()
const twitchMarketSpecifics = new TwitchMarketSpecifics()
const wikipediaMarketSpecifics = new WikipediaMarketSpecifics()
const mindsMarketSpecifics = new MindsMarketSpecifics()

export async function validMarketToken({
  marketName,
  tokenName,
}: {
  marketName: string
  tokenName: string
}): Promise<string> {
  if (marketName === twitterMarketSpecifics.getMarketName()) {
    return sameTokenAsValid(tokenName)
  } else if (marketName === substackMarketSpecifics.getMarketName()) {
    return sameTokenAsValid(tokenName)
  } else if (marketName === showtimeMarketSpecifics.getMarketName()) {
    return sameTokenAsValid(tokenName)
  } else if (marketName === twitchMarketSpecifics.getMarketName()) {
    return sameTokenAsValid(tokenName)
  } else if (marketName === wikipediaMarketSpecifics.getMarketName()) {
    return wikipediaValidator(tokenName)
  } else if (marketName === mindsMarketSpecifics.getMarketName()) {
    return mindsValidator(tokenName)
  } else {
    throw new Error('Market is not supported for token validation')
  }
}

function sameTokenAsValid(tokenName: string) {
  return tokenName
}
