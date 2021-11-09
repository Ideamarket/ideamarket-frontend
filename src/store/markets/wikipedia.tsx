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
    return <WikipediaOutlineBlack />
  }

  getMarketSVGWhite(): JSX.Element {
    return <WikipediaOutlineWhite />
  }

  getMarketSVGTheme(theme?): JSX.Element {
    if (theme === 'dark') {
      return <WikipediaOutlineWhite />
    } else {
      return <WikipediaOutlineBlack />
    }
  }

  // Tokens

  getTokenURL(tokenName: string): string {
    return `https://en.wikipedia.org/wiki/${tokenName.slice(1)}`
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
