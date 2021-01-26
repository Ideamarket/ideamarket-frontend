import _ from 'lodash'

import TwitterMarketSpecifics from './twitter'
import SubstackMarketSpecifics from './substack'

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
  getVerificationExplanation(): string
  getVerificationSHAPrompt(uuid: string): string
  getVerificationSHAPromptExplanation(): string
  getVerificationConfirmCheckboxLabel(): string
}

const specifics: IMarketSpecifics[] = [
  new TwitterMarketSpecifics(),
  new SubstackMarketSpecifics(),
]

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
