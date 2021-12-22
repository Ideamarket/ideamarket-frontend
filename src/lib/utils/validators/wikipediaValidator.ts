import { findValidPageTitle } from 'lib/utils/wikipedia/validPageTitleUtil'

export async function wikipediaValidator(tokenName: string): Promise<string> {
  try {
    const validTokenName = await findValidPageTitle(
      decodeURIComponent(tokenName)
    )
    return validTokenName ?? null
  } catch (error) {
    console.error('Error occurred while validating wikipedia tokenName', error)
    return null
  }
}
