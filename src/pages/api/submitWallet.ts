import type { Handlers } from 'lib/utils/createHandlers'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiResponseData, createHandlers } from 'lib/utils/createHandlers'
import { getSession } from 'next-auth/client'
import { updateUserSettings } from 'lib/models/userModel'
import { recoverAddresses } from 'lib/utils/web3-eth'
import { EthAddress } from 'next-auth'
import { addNewVerifiedAddress, updateVerifiedAddress } from 'lib/utils/address'

/**
 * POST: Recover the address that is signed and add the recovered address to DB
 */
const handlers: Handlers<Partial<ApiResponseData>> = {
  POST: async (req, res) => {
    try {
      const session = await getSession({ req })
      if (!session) {
        res.status(401).json({ message: 'Unauthorized' })
        return
      }
      const ethAddresses: EthAddress[] = session.user.ethAddresses
        ? session.user.ethAddresses
        : []

      const { message, signature } = req.body
      const recoveredAddress = recoverAddresses({ message, signature })

      const isAddressAlreadyExists = ethAddresses
        .map((ethAddress) => ethAddress.address)
        .includes(recoveredAddress)

      const finalAddresses = isAddressAlreadyExists
        ? updateVerifiedAddress({
            verifiedAddress: recoveredAddress,
            allAddresses: ethAddresses,
          })
        : addNewVerifiedAddress({
            verifiedAddress: recoveredAddress,
            allAddresses: ethAddresses,
          })

      await updateUserSettings({
        userId: session.user.id,
        userSettings: {
          ethAddresses: finalAddresses,
        },
      })

      res.status(200).json({ message: 'Successfully updated ethAdress' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Something went wrong!!' })
    }
  },
}

export default function submitWallet(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseData>
) {
  const handler = createHandlers(handlers)
  return handler(req, res)
}
