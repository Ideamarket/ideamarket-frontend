import type { Handlers } from 'lib/utils/createHandlers'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiResponseData, createHandlers } from 'lib/utils/createHandlers'

/**
 * POST
 */
const handlers: Handlers<Partial<ApiResponseData>> = {
  POST: async (req, res) => {
    try {
      res.status(200).json({ message: 'Success' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Something went wrong!!' })
    }
  },
}

export default function hello(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseData>
) {
  const handler = createHandlers(handlers)
  return handler(req, res)
}
