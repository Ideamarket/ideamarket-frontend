import { getSession } from 'next-auth/client'
import type { Handlers } from 'lib/utils/createHandlers'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiResponseData, createHandlers } from 'lib/utils/createHandlers'
import { EthAddress } from 'next-auth'
import { updateUserSettings } from 'lib/models/userModel'
import { isAddressValid } from 'lib/utils/web3-eth'

/**
 * This api is to add/remove multiple ethAddress into/from DB at once
 *
 * POST : Add multiple unverified ethAddresses. Body = {addresses: string[]}
 * DELETE : Remove multiple ethAddresses. Body = {addresses: string[]}
 */
const handlers: Handlers<Partial<ApiResponseData>> = {
  POST: async (req, res) => {
    try {
      const session = await getSession({ req })
      if (!session) {
        return res.status(401).json({ message: 'Unauthorized' })
      }
      const existingAddresses: EthAddress[] = session.user.ethAddresses
        ? session.user.ethAddresses
        : []

      const { addresses } = req.body
      if (!Array.isArray(addresses)) {
        return res
          .status(400)
          .json({ message: 'Bad request - addresses should be string array' })
      }

      const allAddressesValid = addresses.every((address: string) =>
        isAddressValid(address)
      )
      if (!allAddressesValid) {
        return res.status(400).json({ message: 'Invalid address is present' })
      }

      const addressesToBeAdded: EthAddress[] = addresses
        .filter(
          (address) =>
            !existingAddresses
              .map((existingAddress) => existingAddress.address)
              .includes(address)
        )
        .map((address: string) => ({ address, verified: false }))

      const finalAddresses = [...existingAddresses, ...addressesToBeAdded]
      await updateUserSettings({
        userId: session.user.id,
        userSettings: {
          ethAddresses: finalAddresses,
        },
      })

      res.status(200).json({ message: 'Successfully added new addresses' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Something went wrong!!' })
    }
  },

  DELETE: async (req, res) => {
    try {
      const session = await getSession({ req })
      if (!session) {
        return res.status(401).json({ message: 'Unauthorized' })
      }
      const existingAddresses: EthAddress[] = session.user.ethAddresses
        ? session.user.ethAddresses
        : []
      if (existingAddresses === []) {
        return res.status(200).json({ message: 'Addresses are already empty' })
      }

      const { addresses } = req.body
      if (!Array.isArray(addresses)) {
        return res
          .status(400)
          .json({ message: 'Bad request - addresses should be string array' })
      }

      const finalAddresses = existingAddresses.filter(
        (ethAddress) => !addresses.includes(ethAddress.address)
      )
      await updateUserSettings({
        userId: session.user.id,
        userSettings: {
          ethAddresses: finalAddresses,
        },
      })

      res.status(200).json({ message: 'Success' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Something went wrong!!' })
    }
  },
}

export default function ethAddress(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseData>
) {
  const handler = createHandlers(handlers)
  return handler(req, res)
}
