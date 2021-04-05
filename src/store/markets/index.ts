import _ from 'lodash'

import TwitterMarketSpecifics from './twitter'
import SubstackMarketSpecifics from './substack'
import ShowtimeMarketSpecifics from './showtime'

export type IMarketSpecifics = {
  // Market
  getMarketName(): string
  isEnabled(): boolean
  getMarketNameURLRepresentation(): string
  getMarketSVGBlack(): JSX.Element
  getMarketSVGWhite(): JSX.Element
  getMarketOutlineSVG(): JSX.Element

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

export function getMarketSpecifics() {
  return specifics
}

export function getMarketSpecificsByMarketName(
  marketName: string
): IMarketSpecifics {
  return _.find(specifics, (s) => s.getMarketName() === marketName)
}

export function getMarketSpecificsByMarketNameInURLRepresentation(
  marketNameInURLRepresentation: string
): IMarketSpecifics {
  return _.find(
    specifics,
    (s) => s.getMarketNameURLRepresentation() === marketNameInURLRepresentation
  )
}
