import type { Handlers } from 'lib/utils/createHandlers'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiResponseData, createHandlers } from 'lib/utils/createHandlers'
import { v4 as uuidv4 } from 'uuid'

/**
 * GET: Retrieve random string that user will sign to verify the wallet they are adding to their profile is theirs
 */
const handlers: Handlers<Partial<ApiResponseData>> = {
  GET: async (req, res) => {
    const uuid = uuidv4()
    res.status(200).json({ message: 'Generated random string', data: { uuid } })
  },
}

export default function walletVerificationRequest(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseData>
) {
  const handler = createHandlers(handlers)
  return handler(req, res)
}
