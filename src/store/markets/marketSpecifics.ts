import TwitterMarketSpecifics from './twitter'

export type IMarketSpecifics = {
  // Market
  getMarketName(): string
  getMarketSVG(): JSX.Element

  // Tokens
  getTokenURL(tokenName: string): string
  getTokenIconURL(tokenName: string): string
  convertUserInputToTokenName(userInput: string): string

  // Verification
  getVerificationExplanation(): string
  getVerificationUUIDPrompt(uuid: string): string
  getVerificationUUIDPromptExplanation(): string
  getVerificationConfirmCheckboxLabel(): string
}

const specifics: IMarketSpecifics[] = [new TwitterMarketSpecifics()]

export function getMarketSpecificsByMarketName(
  marketName: string
): IMarketSpecifics {
  for (const s of specifics) {
    if (s.getMarketName() === marketName) {
      return s
    }
  }

  throw 'getMarketSpecificsByMarketName: not found'
}
