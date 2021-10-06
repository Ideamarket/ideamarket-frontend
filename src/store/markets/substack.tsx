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
    return <SubstackOutlineBlack />
  }

  getMarketSVGWhite(): JSX.Element {
    return <SubstackOutlineWhite />
  }

  getMarketSVGTheme(theme?): JSX.Element {
    if (theme === 'dark') {
      return <SubstackOutlineWhite />
    } else {
      return <SubstackOutlineBlack />
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
    return `Verifying myself on ideamarket.io: ${sha} ideamarket.io/i/${marketName}/${tokenName}`
  }

  getVerificationSHAPromptExplanation(): string {
    return `This is your verification code. Please edit your publication's "About" section to contain the below content. After you made the edit, click Next.`
  }

  getVerificationConfirmCheckboxLabel(): string {
    return `I have edited the "About" section.`
  }
}
