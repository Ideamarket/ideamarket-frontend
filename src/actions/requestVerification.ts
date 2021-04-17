import axios from 'axios'

import { IdeaToken } from 'store/ideaMarketsStore'
import { NETWORK } from 'store/networks'

export default async function requestVerification(
  token: IdeaToken,
  ownerAddress: string
): Promise<string> {
  const payload = {
    tokenAddress: token.address,
    ownerAddress: ownerAddress,
    chain: NETWORK.getNetworkName(),
  }

  try {
    const response = await axios.post(
      'https://verification.backend.ideamarket.io/verificationRequest',
      payload
    )
    return response.data.data.uuid
  } catch (ex) {
    if (ex.response?.data?.message) {
      throw ex.response.data.message
    } else {
      throw 'Error while contacting verification service.'
    }
  }
}
