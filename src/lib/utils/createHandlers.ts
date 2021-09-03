import { NextApiRequest, NextApiResponse } from 'next'

export function createHandlers<T>(
  handlers: Handlers<T>
): (req: NextApiRequest, res: NextApiResponse) => Promise<void> {
  return async (req, res) => {
    const handler = handlers[req.method]
    if (handler) {
      try {
        await handler(req, res)
      } catch (err) {
        res.status(err.status || 500).json({ message: err.message })
      }
    } else {
      res.setHeader('Allow', Object.keys(handlers))
      res.status(405).json({ message: `Method ${req.method} Not Allowed` })
    }
  }
}

export type ApiResponseData = {
  message: string
  data: Record<string, any>
}

export type Handlers<T> = Partial<{
  GET: (req: NextApiRequest, res: NextApiResponse<T>) => Promise<void>
  POST: (req: NextApiRequest, res: NextApiResponse<T>) => Promise<void>
  PATCH: (req: NextApiRequest, res: NextApiResponse<T>) => Promise<void>
  DELETE: (req: NextApiRequest, res: NextApiResponse<T>) => Promise<void>
}>
