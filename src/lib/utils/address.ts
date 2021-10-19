import { EthAddress } from 'next-auth'
import { ApiResponseData } from './createHandlers'
import { postData } from './fetch'

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

/*
 * If currently connected address is not linked to the signed-in profile, connect it
 */
export async function checkAndPostNewAddresses(
  connectedAddress: string,
  session,
  refetchSession
) {
  // Is user signed in?
  if (session?.accessToken) {
    // Is connecting address not yet added to this profile?
    const allAddresses = session?.user?.ethAddresses
    if (
      allAddresses.length < 9 &&
      !allAddresses.some((a) => a.address === connectedAddress)
    ) {
      await postData<Partial<ApiResponseData>>({
        url: '/api/ethAddress',
        data: {
          addresses: [connectedAddress],
        },
      }).then(() => {
        refetchSession()
      })
    }
  }
}
