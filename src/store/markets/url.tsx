import { IMarketSpecifics } from '.'
import { queryLambdavatar } from 'actions'
import { GlobeAltIcon } from '@heroicons/react/outline'

export default class UrlMarketSpecifics implements IMarketSpecifics {
  // Market

  getMarketName(): string {
    return 'URL'
  }

  isEnabled(): boolean {
    return true
  }

  getMarketNameURLRepresentation(): string {
    return 'url'
  }

  getMarketSVGBlack(): JSX.Element {
    return <GlobeAltIcon className="w-6" />
  }

  getMarketSVGWhite(): JSX.Element {
    return <GlobeAltIcon className="w-6" />
  }

  getMarketSVGTheme(theme?): JSX.Element {
    if (theme === 'dark') {
      return <GlobeAltIcon className="w-6" />
    } else {
      return <GlobeAltIcon className="w-6" />
    }
  }

  // Tokens

  getTokenURL(tokenName: string): string {
    return `${tokenName}`
  }

  getTokenIconURL(tokenName: string): Promise<string> {
    return queryLambdavatar({
      rawMarketName: this.getMarketNameURLRepresentation(),
      rawTokenName: this.getTokenNameURLRepresentation(tokenName),
    })
  }

  /**
   * Convert URL input to token value that will be stored on blockchain
   */
  convertUserInputToTokenName(userInput: string): string {
    return `${userInput}`
  }

  getTokenNameURLRepresentation(tokenName: string): string {
    return tokenName
  }

  getTokenNameFromURLRepresentation(
    tokenNameInURLRepresentation: string
  ): string {
    return `${tokenNameInURLRepresentation}`
  }

  getTokenDisplayName(tokenName: string): string {
    return tokenName
  }

  // List Token

  getListTokenPrefix(): string {
    return ''
  }

  getListTokenSuffix(): string {
    return ''
  }

  // Verification

  isVerificationEnabled(): boolean {
    return false
  }

  getVerificationExplanation(): string {
    return `To verify, you will be asked to add a verification code to your account's bio. After verification is complete you can remove it.`
  }

  getVerificationSHAPrompt(
    sha: string,
    marketName: string,
    tokenName: string
  ): string {
    return `Verifying myself on ideamarket.io: ${sha} ideamarket.io/i/${marketName}/${tokenName}`
  }

  getVerificationSHAPromptExplanation(): string {
    return `This is your verification code. Please edit your account's bio to contain the below content. After you made the edit, click Next.`
  }

  getVerificationConfirmCheckboxLabel(): string {
    return `I have edited the bio.`
  }
}
