import { IMarketSpecifics } from '.'
import WikipediaOutlineWhite from '../../assets/wikipedia-outline-white.svg'
import WikipediaOutlineBlack from '../../assets/wikipedia-outline-black.svg'
import { queryLambdavatar } from 'actions'

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
    return `https://en.wikipedia.org/wiki/${tokenName}`
  }

  getTokenIconURL(tokenName: string): Promise<string> {
    return queryLambdavatar({
      rawMarketName: this.getMarketNameURLRepresentation(),
      rawTokenName: this.getTokenNameURLRepresentation(tokenName),
    })
  }

  normalizeUserInputTokenName(userInput: string): string {
    return userInput.charAt(0).toUpperCase() + userInput.slice(1).toLowerCase()
  }

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
