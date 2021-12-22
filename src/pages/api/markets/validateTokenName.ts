import type { Handlers } from 'lib/utils/createHandlers'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiResponseData, createHandlers } from 'lib/utils/createHandlers'
import { validMarketToken } from 'lib/utils/validators'

/**
 * GET : Returns the valid token name for the specified market
 */
const handlers: Handlers<Partial<ApiResponseData>> = {
  GET: async (req, res) => {
    try {
      const marketName = req.query.marketName as string
      const tokenName = req.query.tokenName as string

      const validToken = await validMarketToken({ marketName, tokenName })
      if (!validToken) {
        return res
          .status(404)
          .json({ message: 'Token name is not valid', data: { validToken } })
      }

      return res
        .status(200)
        .json({ message: 'Token name is valid', data: { validToken } })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Something went wrong!!' })
    }
  },
}

export default function validateTokenName(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseData>
) {
  const handler = createHandlers(handlers)
  return handler(req, res)
}
