import create from 'zustand'

import TwitterMarketSpecifics from './twitter'
import SubstackMarketSpecifics from './substack'
import ShowtimeMarketSpecifics from './showtime'
import TwitchMarketSpecifics from './twitch'
import { queryMarkets } from 'store/ideaMarketsStore'
import { find } from 'utils/lodash'

export type IMarketSpecifics = {
  // Market
  getMarketName(): string
  isEnabled(): boolean
  getMarketNameURLRepresentation(): string
  getMarketSVGBlack(): JSX.Element
  getMarketSVGWhite(): JSX.Element
  getMarketSVGTheme(theme?): JSX.Element

  // Tokens
  getTokenURL(tokenName: string): string
  getTokenIconURL(tokenName: string): Promise<string>
  normalizeUserInputTokenName(userInput: string): string
  convertUserInputToTokenName(userInput: string): string
  getTokenNameURLRepresentation(tokenName: string): string
  getTokenNameFromURLRepresentation(
    tokenNameInURLRepresentation: string
  ): string

  // List Token
  getListTokenPrefix(): string
  getListTokenSuffix(): string

  // Verification
  isVerificationEnabled(): boolean
  getVerificationExplanation(): string
  getVerificationSHAPrompt(
    uuid: string,
    marketName: string,
    tokenName: string
  ): string
  getVerificationSHAPromptExplanation(): string
  getVerificationConfirmCheckboxLabel(): string
}

const specifics: IMarketSpecifics[] = [
  new TwitterMarketSpecifics(),
  new SubstackMarketSpecifics(),
  new ShowtimeMarketSpecifics(),
  new TwitchMarketSpecifics(),
]

export function getMarketSpecifics() {
  return specifics
}

export function getMarketSpecificsByMarketName(
  marketName: string
): IMarketSpecifics {
  return find(specifics, (s) => s.getMarketName() === marketName)
}

export function getMarketSpecificsByMarketNameInURLRepresentation(
  marketNameInURLRepresentation: string
): IMarketSpecifics {
  return find(
    specifics,
    (s) => s.getMarketNameURLRepresentation() === marketNameInURLRepresentation
  )
}

type State = {
  markets: any
}

export const useMarketStore = create<State>((set) => ({
  markets: [],
}))

export async function initUseMarketStore() {
  const markets = await queryMarkets('all-markets')

  if (markets) {
    useMarketStore.setState({
      markets: markets
        .filter(
          (market) =>
            getMarketSpecificsByMarketName(market.name) !== undefined &&
            getMarketSpecificsByMarketName(market.name).isEnabled()
        )
        .map((market) => ({
          value: market.marketID.toString(),
          market: market,
        })),
    })
  }
}
