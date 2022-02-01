import { IMarketSpecifics } from '.'
import WikipediaOutlineWhite from '../../assets/wikipedia-outline-white.svg'
import WikipediaOutlineBlack from '../../assets/wikipedia-outline-black.svg'
import { queryLambdavatar } from 'actions'
import { getRealTokenName } from 'utils/wikipedia'

export default class WikipediaMarketSpecifics implements IMarketSpecifics {
  // Market

  getMarketName(): string {
    return 'Wikipedia'
  }

  isEnabled(): boolean {
    return true
  }

  getMarketNameURLRepresentation(): string {
    return 'wikipedia'
  }

  getMarketSVGBlack(): JSX.Element {
    return <WikipediaOutlineBlack className="w-5 h-5" />
  }

  getMarketSVGWhite(): JSX.Element {
    return <WikipediaOutlineWhite className="w-5 h-5" />
  }

  getMarketSVGTheme(theme?): JSX.Element {
    if (theme === 'dark') {
      return <WikipediaOutlineWhite className="w-5 h-5" />
    } else {
      return <WikipediaOutlineBlack className="w-5 h-5" />
    }
  }

  // Tokens

  getTokenURL(tokenName: string): string {
    const realName = tokenName ? getRealTokenName(tokenName) : ''
    return `https://en.wikipedia.org/wiki/${realName}`
  }

  getTokenIconURL(tokenName: string): Promise<string> {
    return queryLambdavatar({
      rawMarketName: this.getMarketNameURLRepresentation(),
      rawTokenName: this.getTokenNameURLRepresentation(tokenName),
    })
  }

  /**
   * @param userInput - The input coming from the user as they type in listing token modal
   * @returns token name in correct format for inserting into smart contract
   */
  convertUserInputToTokenName(userInput: string): string {
    if (!userInput) return null
    const parsedURL = userInput
      .replace('https://', '')
      .replace('www.', '')
      .replace('en.wikipedia.org/wiki/', '')
      .replaceAll('/', '') // get rid of any extra slashes at end of URL
    // Replaces all &ndash; (–) and &mdash; (—) symbols with simple dashes (-) because only simple dashes can be decoded
    const removedSpecialDashes = parsedURL?.replace(/\u2013|\u2014/g, '-')
    // Decode any special characters
    const decodedInput = decodeURI(removedSpecialDashes)
    // Make sure first char is capitalized
    return `${decodedInput.charAt(0).toUpperCase() + decodedInput.slice(1)}`
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
    const realName = tokenName ? getRealTokenName(tokenName) : ''
    // Replace underscores with spaces
    return realName.replace(/_/g, ' ')
  }

  // List Token

  getListTokenPrefix(): string {
    return 'wikipedia.org/wiki/'
  }

  getListTokenSuffix(): string {
    return ''
  }

  // Verification

  isVerificationEnabled(): boolean {
    return true
  }

  getVerificationExplanation(): string {
    return 'WIKIPEDIA getVerificationExplanation'
  }

  getVerificationSHAPrompt(
    sha: string,
    marketName: string,
    tokenName: string
  ): string {
    return `Verifying myself on ideamarket.io: ${sha} ideamarket.io/i/${marketName}/${tokenName}`
  }

  getVerificationSHAPromptExplanation(): string {
    return 'WIKI - getVerificationSHAPromptExplanation'
  }

  getVerificationConfirmCheckboxLabel(): string {
    return `WIKI - getVerificationConfirmCheckboxLabel`
  }
}
