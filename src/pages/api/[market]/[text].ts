import { getMarketSpecificsByMarketNameInURLRepresentation } from 'store/markets'
import { FileType } from '../_lib/types'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getScreenshot } from '../_lib/chromium'
import { getOGImageHTML } from '../_lib/getOGImageHTML'

const isDev = !process.env.AWS_REGION
const isHtmlDebug = process.env.OG_HTML_DEBUG === '1'

export type TokenAmount = {
  price: string
  name: string
  market: string
  rank: string
  dayChange: string
  stats: {
    amount: number
    holders: number
  }
}

export default async function Handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const text = req.query.text as string
  const textArray = text.split('.')
  const marketSpecifics = getMarketSpecificsByMarketNameInURLRepresentation(
    req.query.market as string
  )
  if (
    textArray.length < 2 ||
    (textArray[textArray.length - 1] !== 'png' &&
      textArray[textArray.length - 1] !== 'jpeg') ||
    !marketSpecifics
  ) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'text/html')
    res.end(
      '<h1>Bad Request</h1><p>Make sure your url looks like `/api/twitter/elonmusk.png` or `/api/image/twitter/elonmusk.jpeg` </p>'
    )
    return
  }
  const rawToken = textArray.slice(0, -1).join('.')
  const fileType = textArray[textArray.length - 1] as FileType
  try {
    const html = await getOGImageHTML({
      rawMarketName: marketSpecifics.getMarketNameURLRepresentation(),
      rawTokenName: rawToken,
      fileType,
    })
    if (isHtmlDebug) {
      res.setHeader('Content-Type', 'text/html')
      res.end(html)
      return
    }
    const file = await getScreenshot(html, 'png', isDev)
    res.statusCode = 200
    res.setHeader('Content-Type', `image/png`)
    res.setHeader(
      'Cache-Control',
      `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`
    )
    res.end(file)
  } catch (error) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'text/html')
    res.end('<h1>Internal Error</h1><p>Sorry, there was a problem</p>')
    console.error(error)
  }
}
