import { IMarketSpecifics } from '.'
import ShowtimeWhite from '../../assets/showtime-white.svg'
import ShowtimeBlack from '../../assets/showtime-black.svg'

export default class ShowtimeMarketSpecifics implements IMarketSpecifics {
  // Market

  getMarketName(): string {
    return 'Showtime'
  }

  getMarketNameURLRepresentation(): string {
    return 'showtime'
  }

  getMarketSVGBlack(): JSX.Element {
    return <ShowtimeBlack />
  }

  getMarketSVGWhite(): JSX.Element {
    return <ShowtimeWhite />
  }

  // Tokens

  getTokenURL(tokenName: string): string {
    return `https://tryshowtime.com/${tokenName.slice(1)}`
  }

  getTokenIconURL(tokenName: string): string {
    return `https://unavatar.backend.ideamarket.io/showtime/${tokenName.slice(
      1
    )}`
  }

  normalizeUserInputTokenName(userInput: string): string {
    return userInput.toLowerCase()
  }

  convertUserInputToTokenName(userInput: string): string {
    return `@${userInput}`
  }

  getTokenNameURLRepresentation(tokenName: string): string {
    return tokenName.slice(1)
  }

  getTokenNameFromURLRepresentation(
    tokenNameInURLRepresentation: string
  ): string {
    return `@${tokenNameInURLRepresentation}`
  }

  // List Token

  getListTokenPrefix(): string {
    return '@'
  }

  getListTokenSuffix(): string {
    return ''
  }

  // Verification

  isVerificationEnabled(): boolean {
    return true
  }

  getVerificationExplanation(): string {
    return 'Verification explanation'
  }

  getVerificationSHAPrompt(sha: string): string {
    return `Verifying myself on ideamarket.io: ${sha}`
  }

  getVerificationSHAPromptExplanation(): string {
    return 'Please do something to verify'
  }

  getVerificationConfirmCheckboxLabel(): string {
    return `I have done XYZ.`
  }
}
