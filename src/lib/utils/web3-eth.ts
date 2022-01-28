import { NETWORK } from 'store/networks'
import Web3 from 'web3'

const web3 = new Web3(NETWORK.getRPCURL())

/**
 * Recovers the address from signature
 */
export function recoverAddresses({
  message,
  signature,
}: {
  message: string
  signature: string
}) {
  return web3.eth.accounts.recover(message, signature)
}

/**
 * Returns whether address is valid or not
 */
export function isAddressValid(address: string) {
  return web3.utils.isAddress(address)
}

export const getSignedInWalletAddress = async ({
  walletVerificationRequest,
  account,
  library,
}) => {
  const { data } = await walletVerificationRequest()
  const uuid: string = data?.uuid
  const message: string = `
      Welcome to Ideamarket!

      Click to sign in and accept the Ideamarket Terms of Service: https://docs.ideamarket.io/legal/terms-of-service

      This request will not trigger a blockchain transaction or cost any gas fees.

      Your authentication status will reset after 30 days.

      Wallet address:
      ${account}

      UUID:
      ${uuid}
    `
  let signature: string = null

  if (message) {
    try {
      signature = await library?.eth?.personal?.sign(message, account, '')
    } catch (error) {
      console.log('metamask signin error', error)
    }
  }
  return message && signature
    ? {
        message,
        signature,
      }
    : null
}
