import { IMarketSpecifics } from '.'
import ShowtimeWhite from '../../assets/showtime-white.svg'
import ShowtimeBlack from '../../assets/showtime-black.svg'
import ShowtimeOutline from '../../assets/showtime-outline.svg'
import { queryLambdavatar } from 'actions'
import { useTheme } from 'next-themes'

function IsDarkTheme() {
  const { theme } = useTheme()
  return theme === 'dark' ? true : false
}

export default class ShowtimeMarketSpecifics implements IMarketSpecifics {
  // Market

  getMarketName(): string {
    return 'Showtime'
  }

  isEnabled(): boolean {
    return true
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

  getMarketOutlineSVG(): JSX.Element {
    return <ShowtimeOutline />
  }

  getMarketSVGTheme(): JSX.Element {
    if (IsDarkTheme) {
      return <ShowtimeWhite />
    } else {
      return <ShowtimeBlack />
    }
  }

  // Tokens

  getTokenURL(tokenName: string): string {
    return `https://tryshowtime.com/${tokenName}`
  }

  getTokenIconURL(tokenName: string): Promise<string> {
    return queryLambdavatar({
      rawMarketName: this.getMarketNameURLRepresentation(),
      rawTokenName: this.getTokenNameURLRepresentation(tokenName),
    })
  }

  normalizeUserInputTokenName(userInput: string): string {
    return userInput.toLowerCase()
  }

  convertUserInputToTokenName(userInput: string): string {
    return userInput
  }

  getTokenNameURLRepresentation(tokenName: string): string {
    return tokenName
  }

  getTokenNameFromURLRepresentation(
    tokenNameInURLRepresentation: string
  ): string {
    return tokenNameInURLRepresentation
  }

  // List Token

  getListTokenPrefix(): string {
    return 'tryshowtime.com/'
  }

  getListTokenSuffix(): string {
    return ''
  }

  // Verification

  isVerificationEnabled(): boolean {
    return true
  }

  getVerificationExplanation(): string {
    return `To verify, you will be asked to add a verification code to your account's Bio. After verification is complete you can remove it.`
  }

  getVerificationSHAPrompt(sha: string): string {
    return `Verifying myself on ideamarket.io: ${sha}`
  }

  getVerificationSHAPromptExplanation(): string {
    return `This is your verification code. Please edit your account's Bio to contain the below content. After you made the edit, click Next.`
  }

  getVerificationConfirmCheckboxLabel(): string {
    return `I have edited my Bio.`
  }
}
