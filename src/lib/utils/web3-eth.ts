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
