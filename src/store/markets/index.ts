import TwitterMarketSpecifics from './twitter'
import SubstackMarketSpecifics from './substack'
import ShowtimeMarketSpecifics from './showtime'
import { isShowtimeMarketVisible } from 'utils'

export type IMarketSpecifics = {
  // Market
  getMarketName(): string
  getMarketNameURLRepresentation(): string
  getMarketSVGBlack(): JSX.Element
  getMarketSVGWhite(): JSX.Element

  // Tokens
  getTokenURL(tokenName: string): string
  getTokenIconURL(tokenName: string): string
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
  getVerificationSHAPrompt(uuid: string): string
  getVerificationSHAPromptExplanation(): string
  getVerificationConfirmCheckboxLabel(): string
}

const specifics: IMarketSpecifics[] = [
  new TwitterMarketSpecifics(),
  new SubstackMarketSpecifics(),
  new ShowtimeMarketSpecifics(),
]

export function getMarketSpecificsByMarketName(
  marketName: string
): IMarketSpecifics {
  return specifics.find((s) => s.getMarketName() === marketName)
}

export function getMarketNames(): string[] {
  return specifics
    .map((market) => market.getMarketName())
    .filter((name) => isShowtimeMarketVisible || name !== 'Showtime')
}

export function getMarketSpecificsByMarketNameInURLRepresentation(
  marketNameInURLRepresentation: string
): IMarketSpecifics {
  return specifics.find(
    (s) => s.getMarketNameURLRepresentation() === marketNameInURLRepresentation
  )
}
