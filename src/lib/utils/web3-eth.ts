import { getRPCUrl } from 'wallets/connectors'
import Web3 from 'web3'

const web3 = new Web3(getRPCUrl())

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
