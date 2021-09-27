import type { Handlers } from 'lib/utils/createHandlers'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiResponseData, createHandlers } from 'lib/utils/createHandlers'
import { getSession } from 'next-auth/client'
import { fetchUserPublicProfile } from 'lib/models/userModel'

/**
 * GET : Fetches the profile public profile of the user
 */
const handlers: Handlers<Partial<ApiResponseData>> = {
  GET: async (req, res) => {
    try {
      const session = await getSession()
      if (!session) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const username = req.query.username
      const userProfile = await fetchUserPublicProfile(username)

      res.status(200).json({
        message: 'Successfully fetched public profile of the user',
        data: userProfile,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Something went wrong!!' })
    }
  },
}

export default function userSettings(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseData>
) {
  const handler = createHandlers(handlers)
  return handler(req, res)
}
