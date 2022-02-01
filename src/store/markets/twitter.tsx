import { IMarketSpecifics } from '.'
import TwitterOutlineWhite from '../../assets/twitter-outline-white.svg'
import TwitterOutlineBlack from '../../assets/twitter-outline-black.svg'
import { queryLambdavatar } from 'actions'

export default class TwitterMarketSpecifics implements IMarketSpecifics {
  // Market

  getMarketName(): string {
    return 'Twitter'
  }

  isEnabled(): boolean {
    return true
  }

  getMarketNameURLRepresentation(): string {
    return 'twitter'
  }

  getMarketSVGBlack(): JSX.Element {
    return <TwitterOutlineBlack className="w-5" />
  }

  getMarketSVGWhite(): JSX.Element {
    return <TwitterOutlineWhite className="w-5" />
  }

  getMarketSVGTheme(theme?): JSX.Element {
    if (theme === 'dark') {
      return <TwitterOutlineWhite className="w-5" />
    } else {
      return <TwitterOutlineBlack className="w-5" />
    }
  }

  // Tokens

  getTokenURL(tokenName: string): string {
    return `https://twitter.com/${tokenName.slice(1)}`
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
    if (!userInput) return null
    const parsedURL = userInput
      .replace('https://', '')
      .replace('www.', '')
      .replace('twitter.com/', '')
      .replaceAll('/', '') // get rid of any extra slashes at end of URL
    return `@${parsedURL.toLowerCase()}`
  }

  getTokenNameURLRepresentation(tokenName: string): string {
    return tokenName.slice(1)
  }

  getTokenNameFromURLRepresentation(
    tokenNameInURLRepresentation: string
  ): string {
    return `@${tokenNameInURLRepresentation}`
  }

  getTokenDisplayName(tokenName: string): string {
    return tokenName
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
    return 'To verify, you will be asked to post a Tweet from this Twitter account containing a verification code.'
  }

  getVerificationSHAPrompt(
    sha: string,
    marketName: string,
    tokenName: string
  ): string {
    return `Verifying myself on ideamarket.io: ${sha} ideamarket.io/i/${marketName}/${tokenName}`
  }

  getVerificationSHAPromptExplanation(): string {
    return 'Please post a Tweet containing the content in the box below. After you have posted the Tweet, click Next. (Note: This must be a new Tweet — a reply to another Tweet will not work properly.)'
  }

  getVerificationConfirmCheckboxLabel(): string {
    return `I have posted the Tweet.`
  }
}
