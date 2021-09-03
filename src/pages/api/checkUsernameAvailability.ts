import { getSession } from 'next-auth/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { isUsernameTaken } from 'lib/models/userModel'
import { ApiResponseData, createHandlers } from 'lib/utils/createHandlers'
import type { Handlers } from 'lib/utils/createHandlers'

/**
 * GET: Returns whether username is available or not
 */
const handlers: Handlers<Partial<ApiResponseData>> = {
  GET: async (req, res) => {
    try {
      const session = await getSession({ req })
      if (!session) {
        res.status(401).json({ message: 'Unauthorized' })
        return
      }

      const { username } = req.body
      const usernameTaken = await isUsernameTaken(username)
      if (usernameTaken) {
        res.status(400).json({ message: 'Username is not available' })
        return
      }

      res.status(200).json({ message: 'Username is available' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Something went wrong!!' })
    }
  },
}

export default function usernameAvailability(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseData>
) {
  const handler = createHandlers<ApiResponseData>(handlers)
  return handler(req, res)
}
