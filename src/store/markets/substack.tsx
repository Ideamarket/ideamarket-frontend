import { IMarketSpecifics } from '.'
import SubstackOutlineWhite from '../../assets/substack-outline-white.svg'
import SubstackOutlineBlack from '../../assets/substack-outline-black.svg'
import { queryLambdavatar } from 'actions'

export default class SubstackMarketSpecifics implements IMarketSpecifics {
  // Market

  getMarketName(): string {
    return 'Substack'
  }

  isEnabled(): boolean {
    return true
  }

  getMarketNameURLRepresentation(): string {
    return 'substack'
  }

  getMarketSVGBlack(): JSX.Element {
    return <SubstackOutlineBlack className="w-5" />
  }

  getMarketSVGWhite(): JSX.Element {
    return <SubstackOutlineWhite className="w-5" />
  }

  getMarketSVGTheme(theme?): JSX.Element {
    if (theme === 'dark') {
      return <SubstackOutlineWhite className="w-5" />
    } else {
      return <SubstackOutlineBlack className="w-5" />
    }
  }

  // Tokens

  getTokenURL(tokenName: string): string {
    return `https://${tokenName}.substack.com/`
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
    let parsedURL = userInput
      .replace('https://', '')
      .replace('www.', '')
      .replace('.substack.com', '')

    const indexOfSlash = parsedURL.indexOf('/')
    const textAfterSlash = parsedURL.substring(indexOfSlash, parsedURL.length)

    // If there is an extra slash (or more) at end, then get rid of it (assuming this is Substack market token)
    if (indexOfSlash !== -1 && textAfterSlash?.length >= 1) {
      parsedURL = parsedURL.substring(0, parsedURL.lastIndexOf('/')) // get rid of any extra slashes at end of URL and any text after
    }

    return parsedURL.toLowerCase()
  }

  getTokenNameURLRepresentation(tokenName: string): string {
    return tokenName
  }

  getTokenNameFromURLRepresentation(
    tokenNameInURLRepresentation: string
  ): string {
    return tokenNameInURLRepresentation
  }

  getTokenDisplayName(tokenName: string): string {
    return tokenName
  }

  // List Token

  getListTokenPrefix(): string {
    return ''
  }

  getListTokenSuffix(): string {
    return '.substack.com'
  }

  // Verification

  isVerificationEnabled(): boolean {
    return true
  }

  getVerificationExplanation(): string {
    return `To verify, you will be asked to add a verification code to your publication's "About" section. After verification is complete you can remove it.`
  }

  getVerificationSHAPrompt(
    sha: string,
    marketName: string,
    tokenName: string
  ): string {
    return `Verifying myself on ideamarket.io: ${sha} ideamarket.io/post/${marketName}/${tokenName}`
  }

  getVerificationSHAPromptExplanation(): string {
    return `This is your verification code. Please edit your publication's "About" section to contain the below content. After you made the edit, click Next.`
  }

  getVerificationConfirmCheckboxLabel(): string {
    return `I have edited the "About" section.`
  }
}
