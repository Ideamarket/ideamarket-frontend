import { EthAddress } from 'next-auth'

/**
 * Updates the address as verfied
 */
export function updateVerifiedAddress({
  verifiedAddress,
  allAddresses,
}: {
  verifiedAddress: string
  allAddresses: EthAddress[]
}) {
  return allAddresses.map((ethAddress) => {
    if (ethAddress.address === verifiedAddress) {
      ethAddress.verified = true
    }
    return ethAddress
  })
}

/**
 * Adds new verfied address to the current list
 */
export function addNewVerifiedAddress({
  verifiedAddress,
  allAddresses,
}: {
  verifiedAddress: string
  allAddresses: EthAddress[]
}) {
  const newAddress: EthAddress = { address: verifiedAddress, verified: true }
  return [...allAddresses, newAddress]
}
