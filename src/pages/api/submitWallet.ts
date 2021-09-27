import type { Handlers } from 'lib/utils/createHandlers'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiResponseData, createHandlers } from 'lib/utils/createHandlers'
import { getSession } from 'next-auth/client'
import { updateUserSettings } from 'lib/models/userModel'

/**
 * POST: Check that signature has been created by correct address and if so, add address to DB
 */
const handlers: Handlers<Partial<ApiResponseData>> = {
  POST: async (req, res) => {
    try {
      const session = await getSession({ req })
      if (!session) {
        res.status(401).json({ message: 'Unauthorized' })
        return
      }

      const { address } = req.body

      // TODO: add address to DB
      // await updateUserSettings({
      //   userId: session.user.id,
      //   userSettings: {
      //     ethAddresses,
      //   },
      // })
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
